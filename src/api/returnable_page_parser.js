const common = require('../common/common.js');
const { get_specific_tag_nodes, 
    get_specific_child_text_nodes,
    get_specific_child_node_by_atter_value
} = require('./page_parser_common');

const log = require('electron-log');
const _ = require('lodash');

module.exports.get_returnable_info_list_from_product_page = ($, account_email) => {

    const returnable_info_list = [];

    $('.order-list').each((_idx, order_info_element)=>{

        try{
            //주문 수량이 1개 인것만 파싱하도록 처리.
            const returnable_info = common.get_returnable_info_obj_scheme();

            //update account_email
            common.update_returnable_info_obj(returnable_info, 'account_email', account_email);
            common.update_returnable_info_obj(returnable_info, '_id', common.uuidv4());

            //# parse order_date
            const el_span_date = get_specific_tag_nodes(order_info_element, [], ['date']);
            if(el_span_date.length === 0) return;
            const el_date_text = get_specific_child_text_nodes(el_span_date[0]);
            if(el_date_text.length === 0) return;
            const order_date = el_date_text[0].data.trim();
            common.update_returnable_info_obj(returnable_info, 'order_date', new Date(order_date));

            //# parse order_price
            const el_span_order_price = get_specific_tag_nodes(order_info_element, [], ['total-price']);
            if(el_span_order_price.length === 0) return;
            const el_span_order_price_child_text_list = get_specific_child_text_nodes(el_span_order_price[0]);
            if(el_span_order_price_child_text_list.length === 0) return;
            const order_price = el_span_order_price_child_text_list[1].data.trim();
            common.update_returnable_info_obj(returnable_info, 'order_price', order_price);

            //# parse order_number
            const el_span_order_number = get_specific_tag_nodes(order_info_element, [], ['order-code']);
            if(el_span_order_number.length === 0) return;
            const el_span_order_child_text_list = get_specific_child_text_nodes(el_span_order_number[0]);
            if(el_span_order_child_text_list.length === 0) return;
            const order_number = el_span_order_child_text_list[1].data.trim();
            common.update_returnable_info_obj(returnable_info, 'order_number', order_number);

            //# parse order id
            const el_input_order_id = get_specific_child_node_by_atter_value(order_info_element, 'name', 'orderId');
            if(el_input_order_id.length === 0) return;
            const order_id = parseInt(el_input_order_id[0].attribs.value.trim());
            common.update_returnable_info_obj(returnable_info, 'order_id', order_id);

            //# parse order item id
            const el_input_order_item_id = get_specific_child_node_by_atter_value(order_info_element, 'name', 'orderItemId');
            if(el_input_order_item_id.length === 0) return;
            const order_item_id = parseInt(el_input_order_item_id[0].attribs.value.trim());
            common.update_returnable_info_obj(returnable_info, 'order_item_id', order_item_id);

            //# parse order returnable quantity
            const el_input_returnable_quantity = get_specific_child_node_by_atter_value(order_info_element, 'name', 'returnedQuantity');
            if(el_input_returnable_quantity.length === 0) return;
            const returnable_quantity = parseInt(el_input_returnable_quantity[0].attribs.value.trim());
            common.update_returnable_info_obj(returnable_info, 'returnable_quantity', returnable_quantity);


            //# parse product_name
            const el_span_product_name = get_specific_tag_nodes(order_info_element, [], ['tit']);
            if(el_span_product_name.length === 0) return;
            const el_product_name_text = get_specific_child_text_nodes(el_span_product_name[0]);
            if(el_product_name_text.length === 0) return;
            const product_name = el_product_name_text[0].data.trim();
            common.update_returnable_info_obj(returnable_info, 'product_name', product_name);

            //# parse product_option and product_model_id
            const el_span_opts = get_specific_tag_nodes(order_info_element, [], ['opt']);
            if(el_span_opts.length < 2) return;

            const el_product_model_id_text = get_specific_child_text_nodes(el_span_opts[0]);
            if(el_product_model_id_text.length === 0) return;
            const product_model_id = el_product_model_id_text[0].data.trim();
            common.update_returnable_info_obj(returnable_info, 'product_model_id', product_model_id);

            const el_product_option_text = get_specific_child_text_nodes(el_span_opts[1]);
            if(el_product_option_text.length === 0) return;
            const product_option = el_product_option_text[0].data.trim();
            common.update_returnable_info_obj(returnable_info, 'product_option', product_option);

            //# parse product_img_url
            const el_img_product_img = get_specific_tag_nodes(order_info_element, ['img']);
            if(el_img_product_img.length === 0) return;
            const product_img_url =  el_img_product_img[0].attribs.src.trim();
            common.update_returnable_info_obj(returnable_info, 'product_img_url', product_img_url);

            returnable_info_list.push(returnable_info);
        }catch(err){
            log.error(common.get_log_str('returnable_page_parser.js', 'get_returnable_info_list_from_product_page', err));
        }
    });

    return returnable_info_list;
}

