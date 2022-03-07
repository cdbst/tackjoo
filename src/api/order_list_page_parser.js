const common = require('../common/common.js');
const { get_specific_tag_nodes, get_specific_child_text_nodes, strip_useless_string } = require('./page_parser_common');
const log = require('electron-log');

function parse_order_list_page($, browser_context){

    const order_info_list = [];

    $('.order-list').each((idx, el)=>{

        try{

            const order_info = common.get_order_info_obj_scheme();
            common.update_order_info_obj(order_info, '_id', common.uuidv4());
            common.update_order_info_obj(order_info, 'account_email', browser_context.email);
            common.update_order_info_obj(order_info, 'account_id', browser_context.id);

            //parse order date
            const el_span_order_date = get_specific_tag_nodes(el, [], ['date']);
            if(el_span_order_date.length === 0) throw new Error('cannot parse order date');
            const order_date = el_span_order_date[0].children[0].data.trim();
            common.update_order_info_obj(order_info, 'date', order_date);

            //parse price 
            const el_span_order_price = get_specific_tag_nodes(el, [], ['total-price']);
            if(el_span_order_price.length === 0) throw new Error('cannot parse product total price - 1');
            const el_text_price = get_specific_child_text_nodes(el_span_order_price[0]);
            if(el_text_price.length <= 1) throw new Error('cannot parse product total price - 2');
            const price = el_text_price[1].data.trim();
            common.update_order_info_obj(order_info, 'price', price);

            //=== get info wrap ===
            const el_div_info_wrap = get_specific_tag_nodes(el, [], ['info-wrap']);
            if(el_div_info_wrap.length === 0) throw new Error('cannot parse info wrap div');

            //parse model id, size opt, quantity
            const el_opt_of_info_warp = get_specific_tag_nodes(el, [], ['opt']);
            if(el_opt_of_info_warp.length < 3) throw new Error('cannot parse opt elements of info wrap div');

            const model_id = el_opt_of_info_warp[0].children[0].data.trim();
            const size = el_opt_of_info_warp[1].children[0].data.trim();
            const quantity = el_opt_of_info_warp[2].children[0].data.trim();

            common.update_order_info_obj(order_info, 'model_id', model_id);
            common.update_order_info_obj(order_info, 'size', size);
            common.update_order_info_obj(order_info, 'quantity', quantity);

            //parse title and url
            const el_span_product_name = get_specific_tag_nodes(el_div_info_wrap[0], [], ['tit']);
            if(el_span_product_name.length === 0) throw new Error('cannot parse tit span');
            const el_a_product_name = get_specific_tag_nodes(el_span_product_name[0], ['a']);
            if(el_a_product_name.length === 0) throw new Error('cannot parse <a> element about product name');

            const product_name = el_a_product_name[0].children[0].data.trim();
            common.update_order_info_obj(order_info, 'name', product_name);

            const product_url = el_a_product_name[0].attribs.href.trim();
            common.update_order_info_obj(order_info, 'url', product_url);

            //parse img_url
            const el_product_img = get_specific_tag_nodes(el, ['img']);
            if(el_product_img.length === 0) throw new Error('cannot parse element about product img');
            const img_url = el_product_img[0].attribs.src.trim();
            common.update_order_info_obj(order_info, 'img_url', img_url);

            //parse status info
            const el_div_status_type = get_specific_tag_nodes(el, [], ['status-type']);
            if(el_div_status_type.length === 0) throw new Error('cannot parse status info div');
            const el_text_of_status_div = get_specific_child_text_nodes(el_div_status_type[0]);
            
            let status = undefined;
            el_text_of_status_div.every((el_text) =>{
                const text = strip_useless_string(el_text.data);
                if(text === '') return true;
                status = text;
                return false;
            });

            if(status === undefined) throw new Error('cannot parse status info');

            common.update_order_info_obj(order_info, 'status', status);

            //parse cancel btn
            const el_cancel_btn = get_specific_tag_nodes(el, ['order-cencel-button']);
            if(el_cancel_btn.length === 0){
                common.update_order_info_obj(order_info, 'is_cancelable', false);
            }else{
                common.update_order_info_obj(order_info, 'is_cancelable', true);
                const cancel_info = el_cancel_btn[0].attribs['v-bind']; // '{orderId:70323678, isJustReservation:false}'
                const order_id = cancel_info.split(',')[0].split(':')[1].trim();
                common.update_order_info_obj(order_info, 'order_id', order_id);
            }

            order_info_list.push(order_info);

        }catch(err){
            log.error(common.get_log_str('order_list_page_parser.js', 'parse_order_list_page', err));
        }
    });

    return order_info_list;
}

module.exports.parse_order_list_page = parse_order_list_page;
