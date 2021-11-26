const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
const common = require("../common/common.js");
const TaskUtils = require('./task_utils.js');
const BrowserContext = require('./browser_context.js').BrowserContext;
const {TaskInfoError, ProductInfoError, OpenProductPageError, SizeInfoError, ApplyDrawError} = require('./task_errors.js');

const browser_context = new BrowserContext(JSON.parse(workerData.browser_context)); //workerData.browser_context is serialized josn string.
const task_info = workerData.task_info;
let product_info = workerData.product_info;
const billing_info = workerData.billing_info;

main(browser_context, task_info, product_info, billing_info);

async function main(browser_context, task_info, product_info, billing_info){

    // STEP1 : Check validation of Task Information.
    if(TaskUtils.is_valid_billing_info_to_tasking(billing_info) == false){
        throw new TaskInfoError(task_info, "TaskInfo is not valid to tasking");
    }
    
    // STEP2 : Check validation of Task Information.
    parentPort.postMessage(common.TASK_STATUS.ON_PAGE);
    
    product_info = await TaskUtils.open_product_page(browser_context, product_info);
    if(product_info == undefined){
        throw new OpenProductPageError("Cannot open product page info");
    }
    
    // STEP3 : Check validation : Product Info is possible to tasking.
    if(TaskUtils.is_valid_product_info_to_tasking(product_info) == false){
        throw new ProductInfoError(product_info, "Product Information is not possible to tasking");
    }

    // STEP4 : Judge product size to checkout.
    const size_info = TaskUtils.judge_appropreate_size_info(product_info, task_info);
    if(size_info == undefined){
        throw new SizeInfoError(product_info, task_info, "Cannot found to proudct size information");
    }
    
    if(product_info.sell_type == common.SELL_TYPE.draw){

        parentPort.postMessage(common.TASK_STATUS.TRY_TO_DRAW);
        let draw_entry_data = TaskUtils.apply_draw(product_info, size_info);
        if(draw_entry_data == undefined){
            throw new ApplyDrawError(product_info, size_info, "Fail with appling THE DRAW");
        }

        process.exit(0);

    }else{

        //TODO add codes for nomal product. // TAST CODE
        click_buy_button();
    }
    
}





//TEST CODE
setInterval(()=>{
    console.log("TEST~~~~~~");
    //parentPort.postMessage('~~~~TEST');
}, 3000);