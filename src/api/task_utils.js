const common = require("../common/common.js");

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

module.exports.open_product_page = async (browser_context, product_info) => {
    
    let new_product_info = await browser_context.open_product_page(product_info.url);
    if(new_product_info == undefined){
        return undefined;
    }
    return common.merge_object(product_info, new_product_info);
};



