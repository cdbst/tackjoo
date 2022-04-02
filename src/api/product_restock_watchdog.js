const common = require('../common/common');
const log = require('electron-log');

class ProductRestockWatchdog{

    RESTOCK_WATCHDOG_TASK_JS_PATH = path.resolve(path.join(app.getAppPath(), 'restock_watchdog_task.js'));

    constructor() {
        this.genWatchdogWorker = this.genWatchdogWorker.bind(this);
        this.addProductToWatch = this.addProductToWatch.bind(this);

        this.watchdog_list = {};
    }

    addProductToWatch(product_info, settings_info) {

        if(product_info.product_id in this.watchdog_list === false) {

            this.watchdog_list[product_info.product_id] = {
                product_info : product_info,
                watchdog_promise : this.genWatchdogWorker(product_info, settings_info),
                worker_obj : undefined,
                watcher_cnt : 0
            };
        }

        this.watchdog_list[product_info.product_id].watcher_cnt++;
        return this.watchdog_list[product_info.product_id].watchdog_promise;
    }

    genWatchdogWorker(product_info, settings_info){

        return new Promise((resolve, reject) =>{
            try{

                this.watchdog_list[product_info.product_id].worker_obj = new Worker(this.RESTOCK_WATCHDOG_TASK_JS_PATH, {
                    workerData : {
                        product_info : product_info,
                        settings_info : settings_info,
                        log_path : log.transports.file.resolvePath()
                    }
                });

                const worker_obj = this.watchdog_list[product_info.product_id].worker_obj;

                worker_obj.on('message', (data) =>{
                    if(data.sku_inventory_info !== undefined){
                        resolve(data.sku_inventory_info);
                    }
                });

                worker_obj.on('error', (err)=>{
                    log.warn(common.get_log_str('restock_watchdog_task.js', 'error-callback', err.message));
                    log.warn(common.get_log_str('restock_watchdog_task.js', 'error-callback', err.stack));
                    reject(err);
                });

                worker_obj.on('exit', (code) => {
                    log.warn(common.get_log_str('restock_watchdog_task.js', 'exit-callback', `Worker stopped with exit code ${code}`));
                    reject(new Error(`Worker stopped with exit code ${code}`));
                });

            }catch(err){
                reject(err);
            }
        });
    }

    removeProductToWatch(product_info) {
        this.watchdog_list[product_info.product_id].watcher_cnt--;

        if(this.watchdog_list[product_info.product_id].watcher_cnt <= 0){
            this.watchdog_list[product_info.product_id].worker_obj.terminate();
        }
    }
}

module.exports.ProductRestockWatchdog = new ProductRestockWatchdog();