const common = require('../common/common');
const log = require('electron-log');
const path = require('path');
const { app } = require('electron');
const { Worker } = require('worker_threads');
const { gen_sensor_data }= require("../ipc/ipc_main_sensor.js");
const TaskCommon = require('./task_common.js');

class ProductRestockWatchdog{

    RESTOCK_WATCHDOG_TASK_JS_PATH = path.resolve(path.join(app.getAppPath(), 'restock_watchdog_task.js'));

    constructor() {
        this.gen_watchdog_worker = this.gen_watchdog_worker.bind(this);
        this.on_watch = this.on_watch.bind(this);
        this.off_watch = this.off_watch.bind(this);
        this.on_recv_api_call = this.on_recv_api_call.bind(this);
        this.gen_sensor_data = this.gen_sensor_data.bind(this);
        this.broadcast_message = this.broadcast_message.bind(this);

        this.watchdog_list = {};
    }

    on_watch(product_info, settings_info, proxy_info) {

        if(product_info.product_id in this.watchdog_list === false) {

            this.watchdog_list[product_info.product_id] = {
                product_info : product_info,
                watchdog_promise : undefined,
                worker_obj : undefined,
                watcher_cnt : 0
            };

            this.watchdog_list[product_info.product_id].watchdog_promise = this.gen_watchdog_worker(product_info, settings_info, proxy_info);
        }

        this.watchdog_list[product_info.product_id].watcher_cnt++;
        return this.watchdog_list[product_info.product_id].watchdog_promise;
    }

    gen_watchdog_worker(product_info, settings_info, proxy_info){

        return new Promise((resolve, reject) =>{
            try{

                this.watchdog_list[product_info.product_id].worker_obj = new Worker(this.RESTOCK_WATCHDOG_TASK_JS_PATH, {
                    workerData : {
                        product_info : product_info,
                        settings_info : settings_info,
                        proxy_info : proxy_info,
                        log_path : log.transports.file.resolvePath()
                    }
                });

                const worker_obj = this.watchdog_list[product_info.product_id].worker_obj;

                worker_obj.on('message', (data) =>{
                    if(data.sku_inventory_info !== undefined){
                        resolve(data.sku_inventory_info);
                        delete this.watchdog_list[product_info.product_id];
                    }else if(data.type == TaskCommon.TASK_MSG_TYPE.API_CALL){
                        this.on_recv_api_call(data);
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

    async gen_sensor_data(){
        const sensor_data = await gen_sensor_data();
        return sensor_data;
    }

    broadcast_message(data){
        for(const worker_data of Object.values(this.watchdog_list)){
            worker_data.worker_obj.postMessage(data);
        }
    }

    on_recv_api_call(data){

        if(data.func in this == false || typeof this[data.func] !== 'function'){
            this.broadcast_message(TaskCommon.gen_api_call_res_payload(data.id, 'Cannot found API Function', undefined));
            return;
        }
        
        if(this[data.func].constructor.name === 'AsyncFunction'){
            (async () =>{
                try{
                    const result = await this[data.func].apply(null, data.params);
                    this.broadcast_message(TaskCommon.gen_api_call_res_payload(data.id, undefined, result));
                    
                }catch(e){
                    this.broadcast_message(TaskCommon.gen_api_call_res_payload(data.id, e, undefined));
                }
            })();
        }else{
            try{
                const result = this[data.func].apply(null, data.params);
                this.broadcast_message(TaskCommon.gen_api_call_res_payload(data.id, undefined, result));
            }catch(e){
                this.broadcast_message(TaskCommon.gen_api_call_res_payload(data.id, e, undefined));
            }
        }
    }
}

module.exports.ProductRestockWatchdog = new ProductRestockWatchdog();