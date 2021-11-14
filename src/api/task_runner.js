const common = require("../common/common.js");

class TaskRunner{
    constructor(browser_context, task_info, product_info, status_channel, task_end_callback){

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.check_stopped = this.check_stopped.bind(this);

        this.click_buy_button = this.click_buy_button.bind(this);
        this.click_apply_draw_button = this.click_apply_draw_button.bind(this);
        this.judge_appropreate_size_info = this.judge_appropreate_size_info.bind(this);
        this.open_product_page = this.open_product_page.bind(this);
        this.is_valid_product_info_to_tasking = this.is_valid_product_info_to_tasking.bind(this);
        this.__end_task = this.__end_task.bind(this);

        this.browser_context = browser_context;
        this.task_info = task_info;
        this.product_info = product_info;
        this.status_channel = status_channel;
        this.task_end_callback = task_end_callback;

        this.running = false;
        this.csrfToken = undefined;

        this.cur_req_id = undefined;

        this.cart_ownership_release = undefined;
    }

    __end_task(task_status){
        this.running = false;
        this.browser_context.open_main_page(() =>{
            if(this.cart_ownership_release != undefined) this.cart_ownership_release();
            this.task_end_callback(task_status);
        });
    }

    judge_appropreate_size_info(){

        if(this.product_info.size_info_list == undefined){
            return undefined;
        }

        let size_info_len = this.product_info.size_info_list.length;

        if(size_info_len == 0){
            return undefined;
        }

        let compare_size = (a, b) => {
            let _a = parseInt(a.replace(/D/gi, ''));
            let _b = parseInt(b.replace(/D/gi, ''));

            return _a - _b
        }

        let size_info_list_has_quantity = [];

        if(this.product_info.sell_type == common.SELL_TYPE.draw){

            let target_size_info = this.product_info.size_info_list.find((size_info) => { return compare_size(size_info.name, this.task_info.size_name) == 0} );
            if(target_size_info != undefined) return target_size_info;

            size_info_list_has_quantity = this.product_info.size_info_list;

        }else{
            size_info_list_has_quantity = this.product_info.size_info_list.filter((size_info) => { return size_info.quantity > 0} );
        }

        if(size_info_list_has_quantity.length == 0){ // 재고가 하나도 없는 상태임.
            return undefined;
        }
        
        let target_size_info = size_info_list_has_quantity.find((size_info) => { return compare_size(size_info.name, this.task_info.size_name) == 0 });
        if(target_size_info != undefined) return target_size_info;

        let min_gap = 9999;

        for(var i = 0; i < size_info_list_has_quantity.length; i++){
            let size_info = size_info_list_has_quantity[i];
            let cur_gap = Math.abs(compare_size(this.task_info.size_name, size_info.name));

            if(min_gap > cur_gap){
                min_gap = cur_gap;
                target_size_info = size_info;
            }
        }

        return target_size_info;
    }

    click_buy_button(){
        //add cart first..

        if(this.check_stopped()) return;

        this.status_channel(common.TASK_STATUS.TRY_DO_PAY);

        let size_info = this.judge_appropreate_size_info();
    
        if(size_info == undefined){
            this.__end_task(common.TASK_STATUS.IMPOSSIBLE_TO_BUY);
            return;
        }

        this.cur_req_id = this.browser_context.add_to_cart(this.product_info, size_info, this.csrfToken, (err, mutex_release, draw_entry_data)=>{

            this.cart_ownership_release = mutex_release;

            if(err){
                this.__end_task(common.TASK_STATUS.FAIL);
                return;
            }else{
                this.__end_task(common.TASK_STATUS.DONE);
            }
        });

    }

    click_apply_draw_button(){

        if(this.check_stopped()) return;

        this.status_channel(common.TASK_STATUS.TRY_TO_DRAW);

        let size_info = this.judge_appropreate_size_info();
    
        if(size_info == undefined){
            this.__end_task(common.TASK_STATUS.IMPOSSIBLE_TO_BUY);
            return;
        }

        this.cur_req_id = this.browser_context.apply_draw(this.product_info, size_info, this.csrfToken, (err, draw_entry_data)=>{

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

        this.cur_req_id = this.browser_context.open_product_page(this.product_info.url, (err, product_info, csrfToken)=>{

            if(err){
                console.error(err);
                this.__end_task(common.TASK_STATUS.FAIL);
                return;
            }

            if(product_info == undefined){
                this.__end_task(common.TASK_STATUS.FAIL);
                return;
            }

            this.product_info = common.merge_object(this.product_info, product_info);

            if(this.is_valid_product_info_to_tasking() == false){
                this.__end_task(common.TASK_STATUS.IMPOSSIBLE_TO_BUY);
                return;
            }

            this.csrfToken = csrfToken;

            if(this.product_info.sell_type == common.SELL_TYPE.draw){
                this.click_apply_draw_button(undefined);
            }else{
                //TODO add codes for nomal product. // TAST CODE
                this.click_buy_button();
            }
        });
    }

    is_valid_product_info_to_tasking(){

        if(this.product_info == undefined) return false;
        if(this.product_info.soldout == undefined || this.product_info.soldout == true) return false;
        if(this.product_info.sell_type != common.SELL_TYPE.draw && this.product_info.item_attr == undefined) return false;
    
        if(this.product_info.size_info_list.length == 0) return false;

        if(this.product_info.sell_type == common.SELL_TYPE.draw) return true;

        let has_quantity = false;
        for(var i = 0; i < this.product_info.size_info_list.length; i++){
            let size_info = this.product_info.size_info_list[i];
            if(size_info.quantity == 1){
                has_quantity = true;
                break;
            }
        }

        return has_quantity;
    }

    start(){
        this.running = true;
        this.open_product_page();
    }

    stop(){
        this.running = false;
        this.__end_task(common.TASK_STATUS.PAUSE);
        if(this.cur_req_id != undefined){
            this.browser_context.cancel_request(this.cur_req_id);
        }
    }

    check_stopped(){
        return !this.running;
    }
}

module.exports.TaskRunner = TaskRunner;