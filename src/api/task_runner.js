const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');

class TaskRunner{
    constructor(browser_context, task_info, product_info, billing_info, message_cb){

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.browser_context = browser_context;
        this.task_info = task_info;
        this.product_info = product_info;
        this.billing_info = billing_info;

        this.message_cb = message_cb;
        this.worker = undefined;
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
    
            this.worker.on('message', (data)=>{
                this.message_cb(data);
            });

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