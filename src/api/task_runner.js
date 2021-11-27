const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const TaskCommon = require('./task_common.js');
const gen_sensor_data = require("../ipc_main_sensor.js").gen_sensor_data;

class TaskRunner{
    constructor(browser_context, task_info, product_info, billing_info, message_cb){

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.on_message = this.on_message.bind(this);
        this.gen_sensor_data = this.gen_sensor_data.bind(this);
        this.on_recv_api_call = this.on_recv_api_call.bind(this);


        this.browser_context = browser_context;
        this.task_info = task_info;
        this.product_info = product_info;
        this.billing_info = billing_info;

        this.message_cb = message_cb;
        this.worker = undefined;
    }

    on_recv_api_call(data){

        if(data.func in this == false || typeof this[data.func] !== 'function'){
            this.worker.postMessage(TaskCommon.gen_api_call_res_payload(data.id, 'Cannot found API Function', undefined));
            return;
        }
        
        if(this[data.func].constructor.name === 'AsyncFunction'){
            (async () =>{
                try{
                    const result = await this[data.func].apply(null, data.params);
                    this.worker.postMessage(TaskCommon.gen_api_call_res_payload(data.id, undefined, result));
                }catch(e){
                    this.worker.postMessage(TaskCommon.gen_api_call_res_payload(data.id, e, undefined));
                }
            })();
        }else{
            try{
                const result = this[data.func].apply(null, data.params);
                this.worker.postMessage(TaskCommon.gen_api_call_res_payload(data.id, undefined, result));
            }catch(e){
                this.worker.postMessage(TaskCommon.gen_api_call_res_payload(data.id, e, undefined));
            }
        }
        
    }

    on_message(data){

        if(data.type == TaskCommon.TASK_MSG_TYPE.MESSAGE){
            this.message_cb(data.message);

        }else if(data.type == TaskCommon.TASK_MSG_TYPE.API_CALL){
            this.on_recv_api_call(data);
        }
    }

    async gen_sensor_data(){
        let sensor_data = await gen_sensor_data();
        return sensor_data;
    }

    start(){

        return new Promise((resolve, reject)=>{
            
            this.worker = new Worker(path.join(__dirname, 'task_test.js'), {
                workerData : {
                    browser_context : JSON.stringify(this.browser_context),
                    task_info : this.task_info,
                    product_info : this.product_info,
                    billing_info : this.billing_info,
                }
            });
    
            this.worker.on('message', this.on_message);

            this.worker.on('error', (err)=>{
                reject(err);
            });

            this.worker.on('exit', (code) => {
                if (code !== 0){
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }else{
                    resolve();
                }
            });
        });
    }

    stop(){
        if(this.worker != undefined) this.worker.terminate();
    }
}

module.exports.TaskRunner = TaskRunner;