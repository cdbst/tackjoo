const common = require('../common/common.js');
const { get_specific_tag_nodes, 
    get_specific_child_text_nodes,
    get_specific_child_node_by_atter_value
} = require('./page_parser_common');

const log = require('electron-log');

module.exports.get_returned_info_list_from_product_page = ($, account_email) => {

    const returned_info_list = [];

    $('.order-list').each((_idx, el_returned_div)=>{
        try{
            
            const returned_info = common.get_returned_info_obj_scheme();

            //update account_email
            common.update_returned_info_obj(returned_info, 'account_email', account_email);
            common.update_returned_info_obj(returned_info, '_id', common.uuidv4());

            //# parse product_name
            const el_span_product_name = get_specific_tag_nodes(el_returned_div, [], ['tit']);
            if(el_span_product_name.length === 0) throw new Error('cannot found product_name information');
            const el_product_name_text = get_specific_child_text_nodes(el_span_product_name[0]);
            if(el_product_name_text.length === 0) throw new Error('cannot found product_name information');
            const product_name = el_product_name_text[0].data.trim();
            common.update_returned_info_obj(returned_info, 'product_name', product_name);

            //# parse product_option and product_model_id
            const el_span_opts = get_specific_tag_nodes(el_returned_div, [], ['opt']);
            if(el_span_opts.length < 2) throw new Error('cannot found product_option and product_model_id information');

            const el_product_model_id_text = get_specific_child_text_nodes(el_span_opts[0]);
            if(el_product_model_id_text.length === 0) throw new Error('cannot found product_model_id information');
            const product_model_id = el_product_model_id_text[0].data.trim();
            common.update_returned_info_obj(returned_info, 'product_model_id', product_model_id);

            const el_product_option_text = get_specific_child_text_nodes(el_span_opts[1]);
            if(el_product_option_text.length === 0) throw new Error('cannot found product_option information');
            const product_option = el_product_option_text[0].data.trim();
            common.update_returned_info_obj(returned_info, 'product_option', product_option);

            //# parse product_img_url
            const el_img_product_img = get_specific_tag_nodes(el_returned_div, ['img']);
            if(el_img_product_img.length === 0) throw new Error('cannot found product_img_url information');
            const product_img_url =  el_img_product_img[0].attribs.src.trim();
            common.update_returned_info_obj(returned_info, 'product_img_url', product_img_url);

            //# parse product_price
            const el_span_product_price = get_specific_tag_nodes(el_returned_div, [], ['price']);
            if(el_span_product_price.length === 0) throw new Error('cannot found product_price information');
            const el_span_product_price_child_text_list = get_specific_child_text_nodes(el_span_product_price[0]);
            if(el_span_product_price_child_text_list.length === 0) throw new Error('cannot found product_price information - 2');
            const product_price = el_span_product_price_child_text_list[0].data.trim();
            common.update_returned_info_obj(returned_info, 'product_price', product_price);

            //# parse order id
            const el_input_order_id = get_specific_child_node_by_atter_value(el_returned_div, 'name', 'orderId');
            if(el_input_order_id.length === 0) throw new Error('cannot found order_id information');
            const order_id = parseInt(el_input_order_id[0].attribs.value.trim());
            common.update_returned_info_obj(returned_info, 'order_id', order_id);

            //# parse returned number
            const el_input_returned_number = get_specific_child_node_by_atter_value(el_returned_div, 'name', 'returnNumber');
            if(el_input_returned_number.length === 0) throw new Error('cannot found returned number information');
            const returned_number = el_input_returned_number[0].attribs.value.trim();
            common.update_returned_info_obj(returned_info, 'returned_number', returned_number);

            //# parse returned date
            const el_span_date = get_specific_tag_nodes(el_returned_div, [], ['date']);
            if(el_span_date.length === 0) throw new Error('cannot found returned date information');
            const el_date_text = get_specific_child_text_nodes(el_span_date[0]);
            if(el_date_text.length === 0) throw new Error('cannot found returned date information - 2');
            const returned_date = el_date_text[0].data.trim();
            common.update_returned_info_obj(returned_info, 'returned_date', new Date(returned_date));

            //# parse returned_quantity
            const el_span_returned_quantity = get_specific_tag_nodes(el_returned_div, [], ['quantity']);
            if(el_span_returned_quantity.length === 0) throw new Error('cannot found returned_quantity information');
            const el_returned_quantity_text = get_specific_child_text_nodes(el_span_returned_quantity[0]);
            if(el_returned_quantity_text.length === 0) throw new Error('cannot found returned_quantity information - 2');
            const returned_quantity = el_returned_quantity_text[0].data.trim();
            common.update_returned_info_obj(returned_info, 'returned_quantity', returned_quantity);

            //# parse returned_status
            const el_span_returned_status = get_specific_tag_nodes(el_returned_div, [], ['status']);
            if(el_span_returned_status.length === 0) throw new Error('cannot found returned_status information');
            const el_returned_status_text = get_specific_child_text_nodes(el_span_returned_status[0]);
            if(el_returned_status_text.length === 0) throw new Error('cannot found returned_status information - 2');
            const returned_status = el_returned_status_text[0].data.trim();
            common.update_returned_info_obj(returned_info, 'returned_status', returned_status);

            //# update is_cancelable
            const is_cancelable = returned_info.returned_status === '반품신청중';
            common.update_returned_info_obj(returned_info, 'is_cancelable', is_cancelable);

            returned_info_list.push(returned_info);
        }catch(err){
            log.error(common.get_log_str('returned_page_parser.js', 'get_returned_info_list_from_product_page', err));
        }
    });

    return returned_info_list;
}