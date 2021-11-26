const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
const common = require("../common/common.js");
const TaskUtils = require('./task_utils.js');
const BrowserContext = require('./browser_context.js').BrowserContext;
const {TaskInfoError, ProductInfoError, OpenProductPageError} = require('./task_errors.js');

let browser_context = new BrowserContext(JSON.parse(workerData.browser_context)); //workerData.browser_context is serialized josn string.

let task_info = workerData.task_info;
let product_info = workerData.product_info;
let billing_info = workerData.billing_info;

async function main(){

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
    
    console.log('test');
    
}
// STEP1 : Check validation of Task Information.

main();

//TEST CODE
setInterval(()=>{
    console.log("TEST~~~~~~");
    //parentPort.postMessage('~~~~TEST');
}, 3000);