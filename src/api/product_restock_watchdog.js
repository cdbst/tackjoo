const common = require('../common/common');
const log = require('electron-log');
const path = require('path');
const { app } = require('electron');
const { Worker } = require('worker_threads');

class ProductRestockWatchdog{

    RESTOCK_WATCHDOG_TASK_JS_PATH = path.resolve(path.join(app.getAppPath(), 'restock_watchdog_task.js'));

    constructor() {
        this.gen_watchdog_worker = this.gen_watchdog_worker.bind(this);
        this.on_watch = this.on_watch.bind(this);
        this.off_watch = this.off_watch.bind(this);

        this.watchdog_list = {};
    }

    on_watch(product_info, settings_info) {

        if(product_info.product_id in this.watchdog_list === false) {

            this.watchdog_list[product_info.product_id] = {
                product_info : product_info,
                watchdog_promise : undefined,
                worker_obj : undefined,
                watcher_cnt : 0
            };

            this.watchdog_list[product_info.product_id].watchdog_promise = this.gen_watchdog_worker(product_info, settings_info);
        }

        this.watchdog_list[product_info.product_id].watcher_cnt++;
        return this.watchdog_list[product_info.product_id].watchdog_promise;
    }

    gen_watchdog_worker(product_info, settings_info){

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
                        delete this.watchdog_list[product_info.product_id];
                    }
                });

                worker_obj.on('error', (err)=>{
                    log.warn(common.get_log_str('restock_watchdog_task.js', 'error-callback', err.message));
                    log.warn(common.get_log_str('restock_watchdog_task.js', 'error-callback', err.stack));
                    reject(err);
                    delete this.watchdog_list[product_info.product_id];
                });

                worker_obj.on('exit', (code) => {
                    log.warn(common.get_log_str('restock_watchdog_task.js', 'exit-callback', `Restock Watchdog Worker stopped with exit code ${code}`));
                    reject(new Error(`Worker stopped with exit code ${code}`));
                    delete this.watchdog_list[product_info.product_id];
                });

            }catch(err){
                log.warn(common.get_log_str('restock_watchdog_task.js', 'catch-error', err.message));
                reject(err);
                delete this.watchdog_list[product_info.product_id];
            }
        });
    }

    off_watch(product_info) {

        if(product_info.product_id in this.watchdog_list === false) return;

        this.watchdog_list[product_info.product_id].watcher_cnt--;

        if(this.watchdog_list[product_info.product_id].watcher_cnt <= 0){
            this.watchdog_list[product_info.product_id].worker_obj.terminate();
        }
    }
}

module.exports.ProductRestockWatchdog = new ProductRestockWatchdog();