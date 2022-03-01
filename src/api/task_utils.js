const common = require("../common/common.js");
const TaskCommon = require('./task_common.js')

module.exports.is_valid_billing_info_to_tasking = (billing_info) =>{
    if(billing_info == undefined) return false;
    if(typeof billing_info !== "object") return false;

    if(billing_info.buyer_addr1 == undefined || billing_info.buyer_addr1 == '') return false;
    if(billing_info.buyer_addr2 == undefined || billing_info.buyer_addr2 == '') return false;
    if(billing_info.buyer_name == undefined || billing_info.buyer_name == '') return false;
    if(billing_info.phone_num == undefined || billing_info.phone_num == '') return false;
    if(billing_info.postal_code == undefined || billing_info.postal_code == '') return false;
    if(billing_info.pay_method == undefined || billing_info.pay_method == '') return false;
    if(billing_info.pay_method != undefined && billing_info.pay_method === 'payco'){
        if(billing_info.payco_info == undefined) return false;
        if(billing_info.payco_info.pay_email == undefined || billing_info.payco_info.pay_email == '') return false;
        if(billing_info.payco_info.pay_pwd == undefined || billing_info.payco_info.pay_pwd == '') return false;
        if(billing_info.payco_info.checkout_pwd == undefined || billing_info.payco_info.checkout_pwd == '') return false;
        if(billing_info.payco_info.birthday == undefined || billing_info.payco_info.birthday == '') return false;
    }
    return true;
}

module.exports.is_valid_product_info_to_tasking = (product_info) =>{

    if(product_info == undefined) return 'product info is not valid.';
    if(product_info.soldout == undefined || product_info.soldout == true) return 'product has been probably soldout.';
    if(product_info.sell_type != common.SELL_TYPE.draw && product_info.item_attr == undefined) return 'product size info is not valid - item_attr info is missing.';
    if(product_info.size_info_list.length == 0) return 'product has been probably soldout. size info list is empty.';
    if(product_info.sell_type == common.SELL_TYPE.draw) return undefined;

    for(var i = 0; i < product_info.size_info_list.length; i++){
        let size_info = product_info.size_info_list[i];
        if(size_info.quantity > 0){
            return undefined;
        }
    }

    return 'product has been probably soldout. all of size info quantity is zero';
}

module.exports.judge_appropreate_non_shoe_size_info = (product_info, task_info) => {

    if(product_info.sell_type == common.SELL_TYPE.draw){
        let target_size_info = product_info.size_info_list.find((size_info) => { return size_info.name === task_info.size_name});
        if(target_size_info != undefined) return target_size_info;
    }

    const size_info_list_has_quantity = this.get_size_info_list_has_quantity(product_info);
    if(size_info_list_has_quantity.length == 0) return undefined;

    const target_size_info = size_info_list_has_quantity.find((size_info) => { return size_info.name === task_info.size_name} );
    if(target_size_info !== undefined) return target_size_info;

    return size_info_list_has_quantity[Math.floor((size_info_list_has_quantity.length - 1) / 2)];
}

module.exports.get_size_info_list_has_quantity = (product_info) => {

    let size_info_list_has_quantity = [];

    if(product_info.sell_type == common.SELL_TYPE.draw){
        size_info_list_has_quantity = product_info.size_info_list;
    }else{
        size_info_list_has_quantity = product_info.size_info_list.filter((size_info) => { return size_info.quantity > 0} );
    }

    return size_info_list_has_quantity;
}

module.exports.judge_appropreate_size_info = (product_info, task_info) =>{

    if(product_info.size_info_list == undefined){
        return undefined;
    }

    if(product_info.size_info_list.length == 0){
        return undefined;
    }else if(task_info.size_name === '무작위'){
        return product_info.size_info_list[common.get_random_int(0, product_info.size_info_list.length -1)];
    }else if(product_info.size_info_list.length === 1){ // free size일 경우 처리.
        const maybe_free_size_info = product_info.size_info_list[0];
        if(maybe_free_size_info.name === 'FREE' || maybe_free_size_info.friendly_name === 'FREE'){
            if(maybe_free_size_info.quantity > 0) return maybe_free_size_info;
            else return undefined;
        }
    }

    if(task_info.size_name.replace(/\D/g, '') === ''){ // 신발이 아님.
        return this.judge_appropreate_non_shoe_size_info(product_info, task_info);
    }

    const compare_size = (a, b) => {
        const _a = parseInt(a.replace(/\D/gi, ''));
        const _b = parseInt(b.replace(/\D/gi, ''));

        return _a - _b;
    };

    if(product_info.sell_type == common.SELL_TYPE.draw){
        let target_size_info = product_info.size_info_list.find((size_info) => { return compare_size(size_info.name, task_info.size_name) == 0} );
        if(target_size_info != undefined) return target_size_info;
    }

    const size_info_list_has_quantity = this.get_size_info_list_has_quantity(product_info);
    if(size_info_list_has_quantity.length == 0) return undefined;
    
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

module.exports.login = async (browser_context) => {

    const result = await browser_context.login();
    return result;
}

module.exports.open_product_page = async (browser_context, product_info, retry_cnt) => {

    const new_product_info = await browser_context.open_product_page(product_info.url, retry_cnt);
    if(new_product_info == undefined){
        return undefined;
    }
    return common.merge_object(product_info, new_product_info);
}

module.exports.get_product_sku_inventory = async (browser_context, product_info, watchdog, settings_info) => {

    let sku_inventory_info = undefined;

    if(watchdog){
        do{
            sku_inventory_info = await browser_context.get_product_sku_inventory(product_info.url, product_info);
            //browser_context.open_main_page();
            await common.async_sleep(settings_info.restock_watchdog_interval * 1000);
            if(sku_inventory_info == undefined) continue;
        }while(sku_inventory_info.usable === false)
    }else{
        sku_inventory_info = await browser_context.get_product_sku_inventory(product_info.url, product_info);
        if(sku_inventory_info == undefined){
            return undefined;
        }
    }
    return sku_inventory_info;
}

module.exports.apply_draw = async(browser_context, product_info, size_info) =>{

    const draw_entry_data = await browser_context.apply_draw(product_info, size_info);
    return draw_entry_data;
}

module.exports.add_to_cart = async(browser_context, product_info, size_info) =>{

    let size_info_has_quantity = this.get_size_info_list_has_quantity(product_info);

    while(true){

        const res_data = await browser_context.add_to_cart(product_info, size_info);
        if(res_data === undefined) return undefined;
        if('sku_id' in res_data === false) return size_info;

        size_info_has_quantity = size_info_has_quantity.filter(si => si.sku_id !== res_data.sku_id);
        const rand_idx = common.get_random_int(0, size_info_has_quantity.length - 1);
        size_info = size_info_has_quantity[rand_idx];
    }
}

module.exports.checkout_singleship = async(browser_context, billing_info, product_info) =>{
    const kakaopay_prepare_payload = await browser_context.checkout_singleship(billing_info, product_info);
    return kakaopay_prepare_payload;
};

module.exports.checkout_request = async(browser_context, billing_info, product_info) =>{
    const checkout_result = await browser_context.checkout_request(billing_info, product_info);
    return checkout_result;
}

module.exports.prepare_pay = async(browser_context, prepare_pay_payload, billing_info) =>{
    const pay_url = await browser_context.prepare_pay(prepare_pay_payload, billing_info);
    return pay_url;
}

module.exports.open_checkout_page = async(browser_context, product_info) =>{
    const result = await browser_context.open_checkout_page(product_info);
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