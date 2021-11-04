const gen_sensor_data = require("../ipc_main_sensor.js").gen_sensor_data;

class TaskRunner{
    constructor(browser_context, task_info, product_info, status_channel){

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.open_product_page = this.open_product_page.bind(this);
        this.judge_appropreate_size= this.judge_appropreate_size.bind(this);
        this.send_sensor_data = this.send_sensor_data.bind(this);
        this.click_apply_draw_button = this.click_apply_draw_button.bind(this);

        this.browser_context = browser_context;
        this.task_info = task_info;
        this.product_info = product_info;
        this.status_channel = status_channel;

        this.__stop = false;
        this.retry_cnt = task_info.retry_cnt == undefined ? 100 : task_info.retry_cnt;
    }

    judge_appropreate_size(){

    }

    send_sensor_data(__callback){

        gen_sensor_data((error, sensor_data)=>{

            if(error){
                console.warn('cannot generate sensor data.');
            }

            this.browser_context.send_sensor_data(sensor_data, (error) =>{
                if(error){
                    console.warn('fail with send sensor data.');
                }
                __callback();
            });
        });
    }

    start(__callback){

        this.__stop = false;
        this.open_product_page(__callback);
    }

    click_apply_draw_button(csrfToken, retry, __callback){

        this.send_sensor_data(()=>{
            //this.browser_context.apply_draw(csrfToken)
        });
    }

    open_product_page(__callback){

        this.__stop = false;

        const open_page_cb = (err, retry, csrfToken, $) => {

            if(err){
                if(retry == 0){
                    __callback('cannot access to product page');
                }else{
                    this.browser_context.open_page(this.product_info.product_url, --retry, open_page_cb);
                }
                return;
            }

            if(csrfToken == undefined){
                if(retry == 0){
                    __callback('cannot found access token from product page');
                }else{
                    this.browser_context.open_page(this.product_info.product_url, --retry, open_page_cb);
                }
                return;
            }

            if(this.product_info.sell_type == common.SELL_TYPE.draw){
                this.click_apply_draw_button(csrfToken, this.retry_cnt, __callback);
            }else{
                //
            }
            
        }

        this.browser_context.open_page(this.product_info.product_url, this.retry_cnt, open_page_cb);
    }


    stop(){
        this.__stop = true;
    }
}