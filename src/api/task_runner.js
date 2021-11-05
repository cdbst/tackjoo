const gen_sensor_data = require("../ipc_main_sensor.js").gen_sensor_data;

class TaskRunner{
    constructor(browser_context, task_info, product_info, status_channel){

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.check_stopped = this.check_stopped.bind(this);

        this.open_product_page = this.open_product_page.bind(this);
        this.send_sensor_data = this.send_sensor_data.bind(this);
        this.click_apply_draw_button = this.click_apply_draw_button.bind(this);
        this.judge_appropreate_size_info = this.judge_appropreate_size_info.bind(this);

        this.browser_context = browser_context;
        this.task_info = task_info;
        this.product_info = product_info;
        this.status_channel = status_channel;

        this.running = false;
        this.retry_cnt = task_info.retry_cnt == undefined ? 100 : task_info.retry_cnt;

        this.csrfToken = undefined;
    }

    judge_appropreate_size_info(){

        let size_info_len = this.product_info.size_info_list.length;

        if(size_info_len == 0){
            return undefined;
        }

        let size_info_list_has_quantity = this.product_info.size_info_list.filter((size_info) => { return size_info.quantity > 0} );

        if(size_info_list_has_quantity.length == 0){ // 재고가 하나도 없는 상태임.
            return undefined;
        }

        let target_size_name = this.task_info.size_name;
        
        let target_size_info = size_info_list_has_quantity.find((size_info) => { return size_info.size_name == target_size_name });
        if(target_size_info != undefined) return target_size_info;

        let min_gap = 9999;
        let target_size = parseInt(target_size_name);
        let target_size_info = undefined;

        for(var i = 0; i < size_info_list_has_quantity.length; i++){
            let size_info = size_info_list_has_quantity[i];
            let size = parseInt(size_info.size_name);
            let cur_gap = Math.abs(target_size - size);

            if(min_gap > cur_gap){
                min_gap = cur_gap;
                target_size_info = size_info;
            }
        }
        return target_size_info;
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


    click_apply_draw_button(size_info, retry, __callback){

        if(this.check_stopped(__callback)) return;

        if(size_info == undefined){
            size_info = this.judge_appropreate_size_info();
        }

        if(size_info == undefined){
            this.running = false;
            __callback('cannot found size information.');
            return;
        }

        this.send_sensor_data(()=>{

            if(this.check_stopped(__callback)) return;

            //apply_draw(product_info, draw_id, sku_id, draw_product_xref, draw_sku_xref, csrfToken, __callback)
            this.browser_context.apply_draw(this.product_info, size_info, this.csrfToken, retry, (err, retry, draw_entry_data)=>{

                if(err){
                    console.error(err);

                    if(retry <= 0){
                        this.running = false;
                        __callback('cannot submit THE DRAW product.');
                    }else{
                        this.click_apply_draw_button(size_info, --retry, __callback);
                    }
                    return;
                }

                //TODO SEND SUCCESS DATA TO Renderer process.
                this.running = false;
                __callback(undefined, draw_entry_data);
            });
        });
    }

    open_product_page(__callback){

        if(this.check_stopped(__callback)) return;

        this.status_channel('open product page');

        const open_page_cb = (err, retry, csrfToken, $) => {

            if(this.check_stopped(__callback)) return;

            if(err){
                if(retry <= 0){
                    this.running = false;
                    __callback('cannot access to product page');
                }else{
                    this.browser_context.open_page(this.product_info.product_url, --retry, open_page_cb);
                }
                return;
            }

            if(csrfToken == undefined){
                if(retry <= 0){
                    this.running = false;
                    __callback('cannot found access token from product page');
                }else{
                    this.browser_context.open_page(this.product_info.product_url, --retry, open_page_cb);
                }
                return;
            }

            this.csrfToken = csrfToken;

            if(this.product_info.sell_type == common.SELL_TYPE.draw){
                this.status_channel('submit THE DRAW product');
                this.click_apply_draw_button(undefined, this.retry_cnt, __callback);
            }else{
                //TODO add codes for nomal product.
            }
            
        }

        this.browser_context.open_page(this.product_info.product_url, this.retry_cnt, open_page_cb);
    }

    start(__callback){

        this.running = true;
        this.open_product_page(__callback);
    }

    stop(){
        this.running = false;
    }

    check_stopped(__callback){
        if(this.running == true) return false;
        
        __callback('task is stopped.');
        return true;
    }
}

module.exports.TaskRunner = TaskRunner;