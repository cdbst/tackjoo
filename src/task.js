const {parentPort, workerData} = require('worker_threads');
const common = require("./common/common.js");
const TaskUtils = require('./api/task_utils.js');
const product_page_parser = require('./api/product_page_parser.js');
const BrowserContext = require('./api/browser_context.js').BrowserContext;
const {TaskInfoError, ProductInfoError, OpenProductPageError, SizeInfoError, 
    ApplyDrawError, AddToCartError, CheckOutSingleShipError, CheckOutRequestError, 
    PrepareKakaoPayError, OpenCheckOutPageError, OpenPayWindowError, LoginError, GetSkuInventoryError} = require('./api/task_errors.js');

const log = require('electron-log');
const app_cfg = require('./app_config');
app_cfg.set_log('info', false, workerData.log_path);

const browser_context = new BrowserContext(JSON.parse(workerData.browser_context)); //workerData.browser_context is serialized josn string.
const task_info = workerData.task_info;
let product_info = workerData.product_info;
const billing_info = workerData.billing_info;
const settings_info = workerData.settings_info;

browser_context.proxy_info = task_info.proxy_info;
browser_context.update_settings(settings_info);

let remain_ret_cnt = settings_info.task_ret_cnt;
const task_ret_interval = settings_info.task_ret_interval * 1000;

process.on('unhandledRejection', (err) => {

    log.warn(common.get_log_str('task.js', 'unhandledRejection-callback', err.message));

    if(remain_ret_cnt > 0){
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.TRY_TO_RETRY]);
        remain_ret_cnt--;
        common.async_sleep(task_ret_interval).then(()=>{
            browser_context.open_main_page();
            main(browser_context, task_info, product_info, billing_info, settings_info);
        });
    }else{
        throw err;
    }
});

process.on('exit', (code) => {
    global.MainThreadApiCaller.call('sync_browser_context', [JSON.stringify(browser_context)]);
    log.info(common.get_log_str('task.js', 'main', 'task thread exit with : ' + code));
});

parentPort.on('message', (data)=>{
    if(data.type == 'exit'){
        process.exit(data.code);
    }
})

global.MainThreadApiCaller = new TaskUtils.MainThreadApiCaller(parentPort);

main(browser_context, task_info, product_info, billing_info, settings_info);

async function main(browser_context, task_info, product_info, billing_info, settings_info){

    log.info(common.get_log_str('task.js', 'main', 'task start'));

    // STEP1 : Check validation of Task Information.
    if(TaskUtils.is_valid_billing_info_to_tasking(billing_info) == false){
        throw new TaskInfoError(task_info, "TaskInfo is not valid to tasking");
    }

    const cur_date = new Date();
    const is_login_session_expired = (browser_context.login_date !== undefined) && 
        (settings_info.nike_login_session_timeout !== 0) &&
        (cur_date > common.add_minutes(browser_context.login_date, settings_info.nike_login_session_timeout));

    if(browser_context.proxy_info !== undefined || //프록시가 셋팅 되어 있으면 무조건 로그인을 다시한다.
        browser_context.login_date === undefined ||  //로그인을 아직 하지 않은 상태라면 로그인을 시도한다.
        is_login_session_expired){ // 로그인이 되어 있지만, 로그인 세션이 만료됐다면 다시 로그인을 시도한다.
        
        // STEP1.5 : Check validation of Task Information.
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.TRY_TO_LOGIN]);
        const login_result = await TaskUtils.login(browser_context);
        if(login_result == undefined){
            throw new LoginError(browser_context, "Cannot open product page info");
        }
    }
    
    if(product_info.sell_type === common.SELL_TYPE.draw){
        // STEP2 : Open Product Page
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.ON_PAGE]);
        product_info = await TaskUtils.open_product_page(browser_context, product_info);
        if(product_info == undefined){
            throw new OpenProductPageError("Cannot open product page info");
        }
    }else{
        // STEP2 : Get Sku inventory information
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.GET_PRODUCT_INFO]);
        const sku_inventory_info = await TaskUtils.get_product_sku_inventory(browser_context, product_info);
        if(sku_inventory_info == undefined){
            throw new GetSkuInventoryError("Cannot gathering product inventory info");
        }
        product_page_parser.update_product_info_as_sku_inventory_info(product_info, sku_inventory_info);
    }

    // STEP3 : Check validation : Product Info is possible to tasking.
    const err = TaskUtils.is_valid_product_info_to_tasking(product_info);
    if(err !== undefined){
        throw new ProductInfoError(product_info, "Product Information is not possible to tasking\n" + err);
    }

    // STEP4 : Judge product size to checkout.
    const size_info = TaskUtils.judge_appropreate_size_info(product_info, task_info);
    if(size_info == undefined){
        throw new SizeInfoError(product_info, task_info, "Cannot found to proudct size information");
    }
    
    if(product_info.sell_type == common.SELL_TYPE.draw){

        // STEP5 : Apply THE DRAW.
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.TRY_TO_DRAW]);
        let draw_entry_data = await TaskUtils.apply_draw(browser_context, product_info, size_info);
        if(draw_entry_data == undefined){
            throw new ApplyDrawError(product_info, size_info, "Fail with appling THE DRAW");
        }

        process.exit(0);

    }else{

        // STEP5 : Add product to cart.
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.ADD_TO_CART]);
        const res_data = await TaskUtils.add_to_cart(browser_context, product_info, size_info);
        if(res_data == undefined){
            throw new AddToCartError(product_info, size_info, "Fail with add to cart");
        }

        // STEP6 : open checkout page
        const open_checkout_page_result = await TaskUtils.open_checkout_page(browser_context, product_info);
        if(open_checkout_page_result == false){
            throw new OpenCheckOutPageError(product_info, "Fail with openning checkout page");
        }

        // STEP7 : chekcout singleship (registering buyer address info)
        const pay_prepare_payload = await TaskUtils.checkout_singleship(browser_context, billing_info);
        if(pay_prepare_payload == undefined){
            throw new CheckOutSingleShipError(billing_info, "Fail with checkout singleship");
        }

        // STEP8 : prepare kakaopay
        const pay_url = await TaskUtils.prepare_pay(browser_context, pay_prepare_payload, billing_info);
        if(pay_url == undefined){
            throw new PrepareKakaoPayError(pay_prepare_payload, "Fail with prepare kakaopay")
        }

        // STEP9 : open kakaopay checkout window
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.READY_TO_PAY]);
        try{
            let open_pay_window_api = undefined;
            if(billing_info.pay_method === 'payco'){
                open_pay_window_api = 'open_payco_window';
            }else if(billing_info.pay_method === 'kakaopay'){
                open_pay_window_api = 'open_kakaopay_window';
            }
            await global.MainThreadApiCaller.call(open_pay_window_api, [pay_url]);
        }catch(e){
            let _err = new OpenPayWindowError(kakao_data, "Open pay window fail");
            _err.stack = e.stack;
            _err.message = e.message;
            throw _err;
        }

        // STEP10 : Click checkout button (결제 버튼 클릭)
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.TRY_TO_PAY]);
        await common.async_sleep(2000);
        const checkout_result = await TaskUtils.checkout_request(browser_context, billing_info);
        if(checkout_result == undefined){
            throw new CheckOutRequestError("Fail with checkout request");
        }

        process.exit(0);
    }
}