const common = require('../common/common.js');
const parser_common = require('./page_parser_common');
const log = require('electron-log');

function parse_thedraw_item_list($, browser_context){

    const thedraw_item_list = [];

    $('.order-list').each((idx, el)=>{

        try{
            //step1 get the draw date
            const el_span_draw_date = parser_common.get_specific_tag_nodes(el, [], ['order-code']);
            if(el_span_draw_date.length == 0) return;

            let draw_date = el_span_draw_date[0].children[0].data; //'응모일시 2021.12.15 10:06:42'
            draw_date = draw_date.replace('응모일시 ', '') //2021.12.15 10:06:42;
            draw_date = new Date(draw_date);

            //step2 get product name and link
            const el_span_product_title = parser_common.get_specific_tag_nodes(el, [], ['tit']);
            if(el_span_product_title.length == 0) return;
            const el_a_product_link = el_span_product_title[0].children[1];

            const product_link = common.NIKE_URL + el_a_product_link.attribs.href;
            const product_name = el_a_product_link.children[0].data;

            //step3 get product size
            const el_span_product_opt = parser_common.get_specific_tag_nodes(el, [], ['opt']);
            if(el_span_product_opt.length == 0) return;
            const product_size = el_span_product_opt[0].children[0].data.split(' / ')[1];

            //step4 get product price
            const el_span_product_price = parser_common.get_specific_tag_nodes(el, [], ['price']);
            if(el_span_product_price.length == 0) return;
            const product_price = el_span_product_price[0].children[0].data.replace(' 원', '');

            //step5 get draw result(당첨, 미당첨)
            const el_span_draw_result = parser_common.get_specific_tag_nodes(el, [], ['btn-order-detail']);
            if(el_span_draw_result.length == 0) return;

            let draw_result = el_span_draw_result[0].children[0].data;
            draw_result = parser_common.strip_useless_string(draw_result);

            let thedraw_item = common.get_thedraw_item_obj_scheme();
            common.update_thedraw_item_obj(thedraw_item, 'product_name', product_name);
            common.update_thedraw_item_obj(thedraw_item, 'product_size', product_size);
            common.update_thedraw_item_obj(thedraw_item, 'product_price', product_price);
            common.update_thedraw_item_obj(thedraw_item, 'product_link', product_link);
            common.update_thedraw_item_obj(thedraw_item, 'draw_date', draw_date);
            common.update_thedraw_item_obj(thedraw_item, 'draw_result', draw_result);
            common.update_thedraw_item_obj(thedraw_item, '_id', common.uuidv4());
            common.update_thedraw_item_obj(thedraw_item, 'account_email', browser_context.email);
            common.update_thedraw_item_obj(thedraw_item, 'account_pwd', browser_context.pwd);

            thedraw_item_list.push(thedraw_item)

        }catch(err){

            log.error(common.get_log_str('thedraw_list_page_parser.js', 'parse_thedraw_item_list', err));
        }
    });

    return thedraw_item_list;
}

module.exports.parse_thedraw_item_list = parse_thedraw_item_list;
