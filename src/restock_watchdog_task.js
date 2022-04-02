const {parentPort, workerData} = require('worker_threads');
const common = require("./common/common.js");
const BrowserContext = require('./api/browser_context.js').BrowserContext;

const log = require('electron-log');
const app_cfg = require('./app_config');
app_cfg.set_log('info', false, workerData.log_path);

const product_info = workerData.product_info;
const settings_info = workerData.settings_info;


global.MainThreadApiCaller = new TaskUtils.MainThreadApiCaller(parentPort);

process.on('unhandledRejection', (err) => {

    log.warn(common.get_log_str('restock_watchdog_task.js', 'unhandledRejection-callback', err.message));
    throw err;
});

process.on('exit', (code) => {
    log.info(common.get_log_str('restock_watchdog_task.js', 'main', 'restock watchdog task thread exit with : ' + code));
});

parentPort.on('message', (data)=>{
    if(data.type === 'exit'){
        process.exit(data.code);
    }
})

main(product_info, settings_info);

async function main(product_info, settings_info){
    const browser_context = new BrowserContext();

    while(true){
        const sku_inventory_info = await browser_context.get_product_sku_inventory(product_info.url, product_info);
        if(sku_inventory_info !== undefined && sku_inventory_info.usable === true) break;
        await common.async_sleep(settings_info.restock_watchdog_interval * 1000);
    }
    
    process.exit(0);
}