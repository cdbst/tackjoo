const {parentPort, workerData} = require('worker_threads');
const common = require("./common/common.js");
const TaskUtils = require('./api/task_utils.js');
const BrowserContext = require('./api/browser_context.js').BrowserContext;
const {TaskInfoError, ProductInfoError, OpenProductPageError, SizeInfoError, 
    ApplyDrawError, AddToCartError, CheckOutSingleShipError, CheckOutRequestError, 
    PrepareKakaoPayError, OpenCheckOutPageError, OpenKakaoPayWindowError, LoginError} = require('./api/task_errors.js');

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
    if(remain_ret_cnt > 0){
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.TRY_TO_RETRY]);
        remain_ret_cnt--;
        common.async_sleep(task_ret_interval).then(()=>{
            main(browser_context, task_info, product_info, billing_info);
        });
    }else{
        throw err;
    }
});

process.on('exit', () => {
    //global.MainThreadApiCaller.call('sync_browser_context', [JSON.stringify(browser_context)]);
});

global.MainThreadApiCaller = new TaskUtils.MainThreadApiCaller(parentPort);

main(browser_context, task_info, product_info, billing_info);

async function main(browser_context, task_info, product_info, billing_info){

    // STEP1 : Check validation of Task Information.
    if(TaskUtils.is_valid_billing_info_to_tasking(billing_info) == false){
        throw new TaskInfoError(task_info, "TaskInfo is not valid to tasking");
    }

    // STEP1.5 : Check validation of Task Information.
    global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.TRY_TO_LOGIN]);
    const login_result = await TaskUtils.login(browser_context);
    if(login_result == undefined){
        throw new LoginError(browser_context, "Cannot open product page info");
    }
    
    // STEP2 : Check validation of Task Information.
    global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.ON_PAGE]);
    product_info = await TaskUtils.open_product_page(browser_context, product_info);
    if(product_info == undefined){
        throw new OpenProductPageError("Cannot open product page info");
    }
    
    // STEP3 : Check validation : Product Info is possible to tasking.
    if(TaskUtils.is_valid_product_info_to_tasking(product_info) == false){
        throw new ProductInfoError(product_info, "Product Information is not possible to tasking");
    }

    // STEP4 : Judge product size to checkout.
    global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.GET_PRODUCT_INFO]);
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
        const kakaopay_prepare_payload = await TaskUtils.checkout_singleship(browser_context, billing_info);
        if(kakaopay_prepare_payload == undefined){
            throw new CheckOutSingleShipError(billing_info, "Fail with checkout singleship");
        }

        // STEP8 : Click checkout button (결제 버튼 클릭)
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.TRY_TO_PAY]);
        await common.async_sleep(3000);
        let checkout_result = await TaskUtils.checkout_request(browser_context);
        if(checkout_result == undefined){
            throw new CheckOutRequestError("Fail with checkout request");
        }

        // STEP9 : prepare kakaopay
        const kakao_data = await TaskUtils.prepare_kakaopay(browser_context, kakaopay_prepare_payload);
        if(kakao_data == undefined){
            throw new PrepareKakaoPayError(kakaopay_prepare_payload, "Fail with prepare kakaopay")
        }

        // STEP10 : open kakaopay checkout window
        global.MainThreadApiCaller.call('send_message', [common.TASK_STATUS.READY_TO_PAY]);
        try{
            await global.MainThreadApiCaller.call('open_kakaopay_window', [kakao_data.next_redirect_pc_url]);
        }catch(e){
            let _err = new OpenKakaoPayWindowError(kakao_data, "Open kakaopay window fail");
            _err.stack = e.stack;
            _err.message = e.message;
            throw _err;
        }

        process.exit(0);
    }
}