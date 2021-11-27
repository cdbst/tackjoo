const common = require("../common/common.js");
const TaskCommon = require('./task_common.js');

module.exports.is_valid_billing_info_to_tasking = (billing_info) =>{
    if(billing_info == undefined) return false;
    if(typeof billing_info !== "object") return false;

    if(billing_info.buyer_addr1 == undefined || billing_info.buyer_addr1 == '') return false;
    if(billing_info.buyer_name == undefined || billing_info.buyer_name == '') return false;
    if(billing_info.phone_num == undefined || billing_info.phone_num == '') return false;
    if(billing_info.postal_code == undefined || billing_info.postal_code == '') return false;

    return true;
}

module.exports.is_valid_product_info_to_tasking = (product_info) =>{

    if(product_info == undefined) return false;
    if(product_info.soldout == undefined || product_info.soldout == true) return false;
    if(product_info.sell_type != common.SELL_TYPE.draw && product_info.item_attr == undefined) return false;

    if(product_info.size_info_list.length == 0) return false;

    if(product_info.sell_type == common.SELL_TYPE.draw) return true;

    let has_quantity = false;
    for(var i = 0; i < product_info.size_info_list.length; i++){
        let size_info = product_info.size_info_list[i];
        if(size_info.quantity == 1){
            has_quantity = true;
            break;
        }
    }

    return has_quantity;
}

module.exports.judge_appropreate_size_info = (product_info, task_info) =>{

    if(product_info.size_info_list == undefined){
        return undefined;
    }

    let size_info_len = product_info.size_info_list.length;

    if(size_info_len == 0){
        return undefined;
    }

    let compare_size = (a, b) => {
        let _a = parseInt(a.replace(/D/gi, ''));
        let _b = parseInt(b.replace(/D/gi, ''));

        return _a - _b
    }

    let size_info_list_has_quantity = [];

    if(product_info.sell_type == common.SELL_TYPE.draw){

        let target_size_info = product_info.size_info_list.find((size_info) => { return compare_size(size_info.name, task_info.size_name) == 0} );
        if(target_size_info != undefined) return target_size_info;

        size_info_list_has_quantity = product_info.size_info_list;

    }else{
        size_info_list_has_quantity = product_info.size_info_list.filter((size_info) => { return size_info.quantity > 0} );
    }

    if(size_info_list_has_quantity.length == 0){ // 재고가 하나도 없는 상태임.
        return undefined;
    }
    
    let target_size_info = size_info_list_has_quantity.find((size_info) => { return compare_size(size_info.name, task_info.size_name) == 0 });
    if(target_size_info != undefined) return target_size_info;

    let min_gap = 999999;

    for(var i = 0; i < size_info_list_has_quantity.length; i++){
        let size_info = size_info_list_has_quantity[i];
        let cur_gap = Math.abs(compare_size(task_info.size_name, size_info.name));

        if(min_gap > cur_gap){
            min_gap = cur_gap;
            target_size_info = size_info;
        }
    }

    return target_size_info;
}

module.exports.open_product_page = async (browser_context, product_info) => {

    const new_product_info = await browser_context.open_product_page(product_info.url);
    if(new_product_info == undefined){
        return undefined;
    }
    return common.merge_object(product_info, new_product_info);
};

module.exports.apply_draw = async(browser_context, product_info, size_info) =>{

    const draw_entry_data = await browser_context.apply_draw(product_info, size_info);
    return draw_entry_data;
}

module.exports.add_to_cart = async(browser_context, product_info, size_info) =>{

    const res_data = await browser_context.add_to_cart(product_info, size_info);
    return res_data;
}

module.exports.checkout_singleship = async(browser_context, billing_info) =>{
    const kakaopay_prepare_payload = await browser_context.checkout_singleship(billing_info);
    return kakaopay_prepare_payload;
};

module.exports.checkout_request = async(browser_context) =>{
    const checkout_result = await browser_context.checkout_request();
    return checkout_result;
}

module.exports.prepare_kakaopay = async(browser_context, prepare_pay_payload) =>{
    const kakao_data = await browser_context.prepare_kakaopay(prepare_pay_payload);
    return kakao_data;
}

module.exports.open_checkout_page = async(browser_context, product_info) =>{
    const result = browser_context.open_checkout_page(product_info);
    return result;
}


class MainThreadApiCaller{

    constructor(parent_port){
        this.call = this.call.bind(this);

        this.parent_port = parent_port;
        this.pending_queue = {};

        this.parent_port.on('message', (message)=>{
            if(message.id in this.pending_queue == false) return;
            this.pending_queue[message.id](message.err, message.data);
            delete this.pending_queue[message.id];
        });
    }

    call(func, params){
        return new Promise((resolve, reject) =>{
            let req_id = common.uuidv4();
            let recv_cb = (err, data) =>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            }
            this.pending_queue[req_id] = recv_cb;
            this.parent_port.postMessage(TaskCommon.gen_api_call_payload(req_id, func, params));
        });
    }
}

module.exports.MainThreadApiCaller = MainThreadApiCaller;