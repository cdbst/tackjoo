const { Worker } = require('worker_threads');
const path = require('path');
const TaskCommon = require('./task_common.js');
const gen_sensor_data = require("../ipc_main_sensor.js").gen_sensor_data;
const ExternalPage = require("./external_page.js").ExternalPage;
const { TaskCanceledError } = require("./task_errors.js");

class TaskRunner{
    constructor(browser_context, task_info, product_info, billing_info, message_cb){

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.end_task = this.end_task.bind(this);
        this.on_message = this.on_message.bind(this);
        this.gen_sensor_data = this.gen_sensor_data.bind(this);
        this.on_recv_api_call = this.on_recv_api_call.bind(this);
        this.open_kakaopay_window = this.open_kakaopay_window.bind(this);
        this.close_pay_window = this.close_pay_window.bind(this);
        this.sync_browser_context = this.sync_browser_context.bind(this);
        this.send_message = this.send_message.bind(this);

        this.browser_context = browser_context;
        this.task_info = task_info;
        this.product_info = product_info;
        this.billing_info = billing_info;

        this.message_cb = message_cb;
        this.running = false;
        this.worker = undefined;
        this.canceled = false;

        this.resolve = undefined;
        this.reject = undefined;
        this.pay_window = undefined;
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

    sync_browser_context(browser_context_json){
        this.browser_context.__init_by_json(JSON.parse(browser_context_json));
    }

    send_message(message){
        this.message_cb(message);
    }

    on_message(data){

        if(data.type == TaskCommon.TASK_MSG_TYPE.API_CALL){
            this.on_recv_api_call(data);
        }
    }

    async gen_sensor_data(){
        let sensor_data = await gen_sensor_data();
        return sensor_data;
    }

    open_kakaopay_window(url){

        let window_opts = {
            width: 420,
            height: 700,
            resizable : false,
            minimizable : false,
            //titleBarStyle : 'hidden',
            webPreferences: {
                webSecurity : false,
                nodeIntegration : false,
                nativeWindowOpen : true
            },
            title : this.product_info.name + ' : ' + this.product_info.price
        }

        let pay_done = false;

        const res_pkt_hooker = (params, response)=>{

            if(response == undefined) return;

            try{
                let res_obj = JSON.parse(response);

                if('expired' in res_obj && res_obj.expired == true){
                    this.end_task(new Error('Kakaopay connection is expired'));
                    return;
                }

                if('cancel_url' in res_obj){
                    this.end_task(new Error('Kakaopay connection is closed. canceled by user'));
                    return;
                }
                // else if('status_result' in res_obj){
                //     if(res_obj.status_result === 'success'){
                //         this.__end_task(common.TASK_STATUS.DONE);
                //     }
                // }
            }catch(e){
                //console.log(e);
            }
        };

        this.pay_window = new ExternalPage(url, window_opts, res_pkt_hooker, true);
        this.pay_window.open();

        this.pay_window.attach_window_close_event_hooker(()=>{
            if(pay_done == false)this.end_task(new Error('Kakaopay connection is closed. canceled by user'));
        });

        //결제 완료시 창을 닫기위한 용도로 추가함.
        this.pay_window.attach_web_contents_event_hooker('did-navigate', (evt, url)=>{
            if(url.includes('https://nike-service.iamport.kr/kakaopay_payments/success')){
                pay_done = true;
                this.end_task();
            }
        });
    }

    start(){
        if(this.canceled) throw new TaskCanceledError(this, 'Task is canceled.');

        this.running = true;

        return new Promise((resolve, reject)=>{

            this.resolve = resolve;
            this.reject = reject;
            
            this.worker = new Worker(path.join(__dirname, 'task.js'), {
                workerData : {
                    browser_context : JSON.stringify(this.browser_context),
                    task_info : this.task_info,
                    product_info : this.product_info,
                    billing_info : this.billing_info,
                }
            });
    
            this.worker.on('message', this.on_message);

            this.worker.on('error', (err)=>{
                this.end_task(err);
            });

            this.worker.on('exit', (code) => {
                if (code !== 0){
                    this.end_task(new Error(`Worker stopped with exit code ${code}`));
                }else{
                    if(this.pay_window == undefined) this.end_task();
                }
            });
        });
    }

    close_pay_window(){
        if(this.pay_window == undefined) return;
        this.pay_window.close();
        this.pay_window = undefined;
    }

    stop(){
        this.canceled = true;
        if(this.worker != undefined) this.worker.terminate();
        this.close_pay_window();
        this.running = false;
    }

    async end_task(error){
        this.close_pay_window();
        if(error){
            this.reject(error);
        }else{
            this.resolve();
        }
        this.running = false;
    }
}

module.exports.TaskRunner = TaskRunner;