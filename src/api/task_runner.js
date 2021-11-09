const common = require("../common/common.js");

class TaskRunner{
    constructor(browser_context, task_info, product_info, status_channel, task_end_callback){

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.check_stopped = this.check_stopped.bind(this);

        this.open_product_page = this.open_product_page.bind(this);
        this.click_apply_draw_button = this.click_apply_draw_button.bind(this);
        this.judge_appropreate_size_info = this.judge_appropreate_size_info.bind(this);
        this.__end_task = this.__end_task.bind(this);

        this.browser_context = browser_context;
        this.task_info = task_info;
        this.product_info = product_info;
        this.status_channel = status_channel;
        this.task_end_callback = task_end_callback;

        this.running = false;
        this.csrfToken = undefined;
    }

    __end_task(task_status){
        this.running = false;
        this.task_end_callback(task_status);
    }

    judge_appropreate_size_info(){

        let size_info_len = this.product_info.size_info_list.length;

        if(size_info_len == 0){
            return undefined;
        }

        if(this.product_info.sell_type == common.SELL_TYPE.draw){
            return this.product_info.size_info_list.find((size_info) => { return size_info.name == this.task_info.size_name} );
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

    click_apply_draw_button(size_info){

        if(this.check_stopped()) return;

        this.status_channel(common.TASK_STATUS.TRY_TO_DRAW);

        if(size_info == undefined){
            size_info = this.judge_appropreate_size_info();
        }

        if(size_info == undefined){
            this.__end_task(common.TASK_STATUS.FAIL);
            return;
        }

        this.browser_context.apply_draw(this.product_info, size_info, this.csrfToken, (err, draw_entry_data)=>{

            if(err){
                console.error(err);
                this.__end_task(common.TASK_STATUS.FAIL);
                return;
            }else{
                this.__end_task(common.TASK_STATUS.DONE);
            }
        });
    }

    open_product_page(){

        if(this.check_stopped()) return;

        this.status_channel(common.TASK_STATUS.ON_PAGE);

        this.browser_context.open_page(this.product_info.url, (err, csrfToken, $)=>{

            if(err){
                console.error(err);
                this.__end_task(common.TASK_STATUS.FAIL);
                return;
            }

            if(csrfToken == undefined){
                console.error('cannot found csrfToken !');
                this.__end_task(common.TASK_STATUS.FAIL);
                return;
            }

            this.csrfToken = csrfToken;

            if(this.product_info.sell_type == common.SELL_TYPE.draw){
                this.click_apply_draw_button(undefined);
            }else{

                //TODO add codes for nomal product. // TAST CODE
                this.__end_task(common.TASK_STATUS.DONE);
            }
        });
    }

    start(){
        this.running = true;
        this.open_product_page();
    }

    stop(){
        this.running = false;
    }

    check_stopped(){
        if(this.running == true) return false;
        
        this.__end_task(common.TASK_STATUS.PAUSE);
        return true;
    }
}

module.exports.TaskRunner = TaskRunner;