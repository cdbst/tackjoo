const common = require('../common/common.js');
const parser_common = require('./page_parser_common');
const log = require('electron-log');
const _ = require('lodash');

function get_sell_type(sell_type_string){

    let sell_type = undefined;

    let text = parser_common.strip_useless_string(sell_type_string).toLowerCase();

    if(text.includes(common.SELL_TYPE.normal.toLowerCase())){
        sell_type = common.SELL_TYPE.normal;
    }else if(text.includes(common.SELL_TYPE.ftfs.toLowerCase())){
        sell_type = common.SELL_TYPE.ftfs;
    }else if(text.includes(common.SELL_TYPE.draw.toLowerCase())){
        sell_type = common.SELL_TYPE.draw;
    }else if(text.includes(common.SELL_TYPE.notify.toLowerCase())){
        sell_type = common.SELL_TYPE.notify;
    }else if(text.includes(common.SELL_TYPE.notify.toLowerCase())){
        sell_type = common.SELL_TYPE.notify;
    }else if(text.includes('품절')){
        sell_type = common.SELL_TYPE.normal;
    }

    return sell_type;
}

function estimate_open_year(month){

    //시작 date 정보에 year 정보가 없으므로 현재 날짜를 구해와서, open_month 가 현재 month보다 이전이면 open year을 내년으로 취급한다.
    let today = new Date();
    let cur_month = today.getMonth(); //return range is (0 ~ 11)

    let year = today.getFullYear()

    if(month < cur_month){
        year++;
    }

    return year;
}

let get_product_list_info_from_feed_page = ($) => {

    let product_list = [];

    $('.launch-list-item').each((idx, el)=>{

        let maybe_meaningful_nodes = parser_common.get_specific_tag_nodes(el, ['a', 'img', 'div', 'button']);

        let product_alt_name = undefined;
        let product_name = undefined;
        let sell_type_text = undefined;
        let product_url = undefined;
        let product_img_url = undefined;
        let product_id = undefined;
        
        for(var i = 0; i < maybe_meaningful_nodes.length; i++){
            let maybe_meaningful_node = maybe_meaningful_nodes[i];

            if(maybe_meaningful_node.name == 'img'){
                product_img_url = maybe_meaningful_node.attribs['data-src'];
                product_alt_name = maybe_meaningful_node.attribs.alt;
            }else if(maybe_meaningful_node.name == 'a' && parser_common.has_class(maybe_meaningful_node, ['card-link'])){
                product_url = common.NIKE_URL + maybe_meaningful_node.attribs.href;
                product_name = maybe_meaningful_node.attribs.title;
            }else if(maybe_meaningful_node.name == 'a' && parser_common.has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                sell_type_text = maybe_meaningful_node.childNodes[0].data;
            }else if(maybe_meaningful_node.name == 'div' && parser_common.has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                sell_type_text = maybe_meaningful_node.childNodes[0].data;
            }else if(maybe_meaningful_node.name == 'button' && parser_common.has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                sell_type_text = maybe_meaningful_node.childNodes[0].data;
            }else if(maybe_meaningful_node.name == 'div' && parser_common.has_attr(maybe_meaningful_node, 'data-id')){
                product_id = maybe_meaningful_node.attribs['data-id'];
            }
        }
        
        if(sell_type_text == undefined) return;
        let sell_type = get_sell_type(sell_type_text);
        if(sell_type == undefined) return;

        let product_info = common.get_product_info_obj_scheme();

        common.update_product_info_obj(product_info, 'name', product_name);
        common.update_product_info_obj(product_info, 'alt_name', product_alt_name);
        common.update_product_info_obj(product_info, 'sell_type', sell_type);
        common.update_product_info_obj(product_info, 'url', product_url);
        common.update_product_info_obj(product_info, 'img_url', product_img_url);
        common.update_product_info_obj(product_info, 'product_id', product_id);

        product_list.push(product_info);
    });

    return product_list;
}

function get_snkrs_product_info_from_product_page ($) {

    try{
        let _product_info = common.get_product_info_obj_scheme();

        common.update_product_info_obj(_product_info, 'category', 'snkrs');

        if($('.product-soldout').length > 0){
            common.update_product_info_obj(_product_info, 'soldout', true);
            //return _product_info;
        }else{
            common.update_product_info_obj(_product_info, 'soldout', false);
        }

        const img_url = parse_product_img_src_from_product_page($);
        if(img_url == undefined) return undefined;
        common.update_product_info_obj(_product_info, 'img_url', img_url);

        const product_name = parse_product_name_from_product_page($);
        if(product_name == undefined) return undefined;
        common.update_product_info_obj(_product_info, 'name', product_name);

        const product_alt_name = parse_product_alt_name_from_product_page($);
        if(product_alt_name == undefined) return undefined;
        common.update_product_info_obj(_product_info, 'alt_name', product_alt_name);
        
        let price = parse_price_from_product_page($);
        if(price == undefined) return undefined;
        common.update_product_info_obj(_product_info, 'price', price);
    
        let product_info_script = get_product_info_script_from_product_page($);
        if(product_info_script == undefined) return undefined;
    
        let product_id = parse_product_id_from_product_page(product_info_script);
        if(product_id == undefined) return undefined;
        common.update_product_info_obj(_product_info, 'product_id', product_id);
    
        let model_id = parse_model_id_from_product_page(product_info_script);
        if(model_id == undefined) return undefined;
        common.update_product_info_obj(_product_info, 'model_id', model_id);
    
        let sell_type = parse_sell_type_from_product_page($);
        common.update_product_info_obj(_product_info, 'sell_type', sell_type);
    
        if(sell_type == common.SELL_TYPE.draw){
    
            parse_draw_product_page($, _product_info);
    
        }else if(sell_type == common.SELL_TYPE.ftfs || sell_type == common.SELL_TYPE.notify){
            
            parse_closed_product_page($, _product_info);
    
        }else if(sell_type = common.SELL_TYPE.normal){
            
            parse_normal_product_page($, _product_info);
        
        }else{
            //TODO : _product_info를 return할지 아니면 undefiend를 return할지 좀 더 고민 필요.
            return undefined;
        }
    
        return _product_info;

    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'get_snkrs_product_info_from_product_page', e));
        return undefined;
    }
}

function get_new_released_product_info_from_product_page ($) {
    try{

        const _product_info = common.get_product_info_obj_scheme();
        common.update_product_info_obj(_product_info, 'category', 'new_released');

        const product_name = parse_product_name_from_new_released_product_page($);
        if(product_name === undefined) return undefined;
        common.update_product_info_obj(_product_info, 'name', product_name);

        const model_id = parse_model_id_from_new_released_product_page($);
        if(model_id === undefined) return undefined;
        common.update_product_info_obj(_product_info, 'model_id', model_id);

        const product_price = parse_product_price_from_new_released_product_page($);
        if(product_price === undefined) return undefined;
        common.update_product_info_obj(_product_info, 'price', product_price);

        const product_id = parse_product_id_from_new_released_product_page($);
        if(product_id === undefined) return undefined;
        common.update_product_info_obj(_product_info, 'product_id', product_id);

        const product_options = parse_product_options_from_new_released_product_page($);
        if(product_options === undefined) return undefined;
        common.update_product_info_obj(_product_info, 'product_options', product_options);

        common.update_product_info_obj(_product_info, 'sell_type', common.SELL_TYPE.normal);
        common.update_product_info_obj(_product_info, 'item_attr', `itemAttributes[${product_options[0].attributeName}]`);
        
        const product_img_url = parse_product_img_url_from_new_released_product_page($);
        if(product_img_url === undefined) return undefined;
        common.update_product_info_obj(_product_info, 'img_url', product_img_url);

        return _product_info;

    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'get_new_released_product_info_from_product_page', e));
        return undefined;  
    }
}

function get_product_info_from_product_page ($) {

    const el_product_option_radio = $('.product-option_radio'); // 해당 element가 존재하면 new released 상품 페이지이다.
    if(el_product_option_radio.length === 0){
        return get_snkrs_product_info_from_product_page($);
    }else{
        return get_new_released_product_info_from_product_page($);
    }
}

function parse_product_img_src_from_product_page($){
    try{
        const img_product_src = $('img[data-ui-gallery-fullscreen-image=primary]');
        if(img_product_src.length == undefined) return undefined;

        return img_product_src[0].attribs.src;

    }catch(err){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_img_src_from_product_page', err));
        return undefined;
    }
}

function parse_price_from_product_page($){
    try{
        let el_price_info_div = $('div.headline-5.pb6-sm.fs14-sm.fs16-md');
        if(el_price_info_div.length == undefined) return undefined;

        let price_info_text = parser_common.get_specific_child_text_nodes(el_price_info_div[0]);

        if(price_info_text.length == 0) return undefined;

        return price_info_text[0].data.trim();
        
    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'parse_price_from_product_page', e));
        return undefined;
    }
}

function parse_product_name_from_product_page($){
    try{

        let el_product_alt_name_h1 = $('h1.headline-5.pb3-sm');
        if(el_product_alt_name_h1.length == undefined) return undefined;

        let product_name_text = parser_common.get_specific_child_text_nodes(el_product_alt_name_h1[0]);

        if(product_name_text.length == 0) return undefined;

        return product_name_text[0].data.trim();
        
    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_name_from_product_page', e));
        return undefined;
    }
}

function parse_product_alt_name_from_product_page($){
    try{
        let el_product_name_h5 = $('h5.headline-1.pb3-sm');
        if(el_product_name_h5.length == undefined) return undefined;

        let product_alt_name_text = parser_common.get_specific_child_text_nodes(el_product_name_h5[0]);

        if(product_alt_name_text.length == 0) return undefined;

        return product_alt_name_text[0].data.trim();
        
    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_alt_name_from_product_page', e));
        return undefined;
    }
}

function parse_draw_product_page($, _product_info){

    let draw_time_info = parse_draw_time_from_product_page($);
    if(draw_time_info != undefined){
        common.update_product_info_obj(_product_info, 'open_time', draw_time_info.open);
        common.update_product_info_obj(_product_info, 'close_time', draw_time_info.close);
    }

    //draw_id와 size_info_list 정보는 draw open 시간일 때만 확인이 가능함.
    let draw_id = parse_draw_id_from_from_product_page($);
    common.update_product_info_obj(_product_info, 'draw_id', draw_id);

    let size_info_list = parse_draw_size_info_list_from_product_page($);
    common.update_product_info_obj(_product_info, 'size_info_list', size_info_list);
}

function parse_closed_product_page($, _product_info){
    let open_time = parse_ftfs_time_from_product_page($);
    if(open_time == undefined) return false;
    common.update_product_info_obj(_product_info, 'open_time', open_time);

    const item_attr = parse_item_attr_from_closed_product_page($);
    if(item_attr === undefined) return false;
    common.update_product_info_obj(_product_info, 'item_attr', item_attr);

    return true;
}

function parse_normal_product_page($, _product_info){
    let item_attr = parse_item_attr_from_product_page($);
    common.update_product_info_obj(_product_info, 'item_attr', item_attr);

    let product_options = parse_product_options_from_product_page($);
    common.update_product_info_obj(_product_info, 'product_options', product_options);
}

function parse_item_attr_from_product_page($){
    let el_input_hidden_options = $('.hidden-option');

    if(el_input_hidden_options.length == 0) return undefined;

    let item_attr = undefined;

    el_input_hidden_options.each((idx, input_hidden_option) =>{
        if('name' in input_hidden_option.attribs == false) return;
        if(input_hidden_option.attribs.name.includes('itemAttributes') == false) return;
        item_attr = input_hidden_option.attribs.name;
    });

    return item_attr;
}

function parse_item_attr_from_closed_product_page($){
    let item_attr_name = parser_common.get_data_tag_value($, 'div', 'data-bu');
    if(item_attr_name === undefined) return undefined;

    const item_attr = `itemAttributes[${item_attr_name}_SIZE]`;
    return item_attr;
}

function parse_product_options_from_product_page($){
    let el_draw_btn = $('.draw-button');
    if(el_draw_btn.length == 0) return undefined;

    let el_div_product_options = parser_common.get_specific_tag_nodes(el_draw_btn[0], ['div']);

    let product_options = [];

    for(var i = 0; i < el_div_product_options.length; i++){
        let el_div = el_div_product_options[i];
        if('data-product-options' in el_div.attribs == false) continue;
        product_options = JSON.parse(el_div.attribs['data-product-options']);
        break;
    }

    return product_options;
}

function parse_draw_time_from_product_page($){
    
    try{

        let el_p_draw_info = $('.draw-info');

        if(el_p_draw_info.length == 0) return undefined;
        
        let text_draw_info = parser_common.get_specific_child_text_nodes(el_p_draw_info[0]);

        if(text_draw_info.length == 0){
            return undefined;
        }

        let text_draw_time = text_draw_info[0].data;
    
        //do parsing (example data -> '10/25(월) 10:00 ~ 10:30 (30분)')
        let text_draw_time_arr = text_draw_time.split(' ~ ');
        let text_draw_time_before = text_draw_time_arr[0];
        let text_draw_time_after = text_draw_time_arr[1];

        let text_draw_time_before_arr = text_draw_time_before.split(' ');
        let draw_date_info = text_draw_time_before_arr[0];
        let draw_start_time = text_draw_time_before_arr[1].split(':');
        let draw_start_hour = parseInt(draw_start_time[0]);
        let draw_start_min = parseInt(draw_start_time[1]);

        let draw_month = parseInt(draw_date_info.split('/')[0]) - 1;
        let draw_date = parseInt(draw_date_info.split('/')[1].replace(/\(.*\)/gi, ''));

        let text_draw_time_after_arr = text_draw_time_after.split(' ');
        let draw_end_time = text_draw_time_after_arr[0].split(':');
        let draw_end_hour = parseInt(draw_end_time[0]);
        let draw_end_min = parseInt(draw_end_time[1]);

        let draw_year = estimate_open_year(draw_month);

        //new Date(년, 월, 일, 시, 분, 초, 밀리초)
        let _draw_start_date = new Date(draw_year, draw_month, draw_date, draw_start_hour, draw_start_min, 0, 0);
        let _draw_end_date = new Date(draw_year, draw_month, draw_date, draw_end_hour, draw_end_min, 0, 0);

        return {
            open : _draw_start_date,
            close : _draw_end_date
        }

    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'parse_draw_time_from_product_page', e));
        return undefined;
    }
}

function parse_ftfs_time_from_product_page($){
    try{
        let el_div_open_time_info = $('.available-date-component');

        if(el_div_open_time_info.length == 0) return undefined;

        let el_open_time_text = parser_common.get_specific_child_text_nodes(el_div_open_time_info[0]);

        if(el_open_time_text.length == 0) return undefined;

        let open_time_text = el_open_time_text[0].data;
        let afternoon = undefined;

        if(open_time_text.includes('오전')){
            afternoon = false;
        }else if(open_time_text.includes('오후')){
            afternoon = true;
        }else{
            return undefined;
        }

        open_time_text = open_time_text.replace(/(\D)/gi, ' ');
        open_time_text = open_time_text.replace(/(\s+)/gi, ' ');
        let open_time_text_arr = open_time_text.split(' ');
        open_time_text_arr.pop();
        
        let open_month = parseInt(open_time_text_arr[0]) - 1;
        let open_date = parseInt(open_time_text_arr[1]);
        let open_hour = parseInt(open_time_text_arr[2]) ;
        let open_min = 0;
        if(open_time_text_arr.length > 3){
            open_min = parseInt(open_time_text_arr[3]);
        }

        open_hour = afternoon ? open_hour + 12 : open_hour;

        //시작 date 정보에 year 정보가 없으므로 현재 날짜를 구해와서, open_month 가 현재 month보다 이전이면 open year을 내년으로 취급한다.
        let open_year = estimate_open_year(open_month);

        //new Date(년, 월, 일, 시, 분, 초, 밀리초)
        return new Date(open_year, open_month, open_date, open_hour, open_min, 0, 0);

    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'parse_ftfs_time_from_product_page', e));
        return undefined;
    }
}

function get_product_info_script_from_product_page($){

    let product_info_script = undefined;
    let scripts = $('script:not([src])');

    scripts.each((idx, script) =>{
        if(Object.keys(script.attribs).length != 0) return;
        if(script.childNodes.length != 1) return;

        let script_code = script.childNodes[0].data;

        if(script_code.includes('categoryInfo =')){
            product_info_script = script;
        } 
    });

    return product_info_script;
}

function parse_product_id_from_product_page(product_info_script){

    let script_code = product_info_script.childNodes[0].data;
    script_code = parser_common.strip_useless_string(script_code);

    let product_id = script_code.split('var productInfo = {')[1].split(',', 1)[0].replace('id : ', '');
    return product_id;
}

function parse_model_id_from_product_page(product_info_script){

    let script_code = product_info_script.childNodes[0].data;
    script_code = parser_common.strip_useless_string(script_code);

    let model_id = script_code.split('model : ')[1].split(',', 1)[0].trim().replace(/\'/gi, '');
    return model_id;
}


function parse_sell_type_from_product_page($){

    let el_order_btn = $('.draw-button');
    if(el_order_btn.length == 0) return undefined;

    let el_buy_btn = $('.btn-buy');

    let el_order_btn_text = undefined;

    if(el_buy_btn.length > 0){
        el_order_btn_text = parser_common.get_specific_child_text_nodes(el_buy_btn[0]);
    }else{
        el_order_btn_text = parser_common.get_specific_child_text_nodes(el_order_btn[0]);
    }

    if(el_order_btn_text.length == 0) return undefined;

    let sell_type = undefined;

    for(var i = 0; i < el_order_btn_text.length; i++){
        
        sell_type = get_sell_type(el_order_btn_text[i].data);
        if(sell_type != undefined) break;
    }

    return sell_type;
}

function parse_draw_size_info_list_from_product_page($){
    
    let size_info_list = [];
    
    try{

        let el_option_list_draw_product = $('*[data-theDrawProductXref]');
        if(el_option_list_draw_product.length == 0) return undefined;

        el_option_list_draw_product.each((idx, el_option) =>{

            if(('data-externalid' in el_option.attribs) == false) return;

            let data_external_id_array = el_option.attribs['data-externalid'].split('  ');
            
            if(data_external_id_array.length != 2) return;

            let external_id = data_external_id_array[0];

            let sku_id = el_option.attribs['data-skuid'];
            if(sku_id == undefined) return;

            let the_draw_product_xref = el_option.attribs['data-thedrawproductxref'];
            if(the_draw_product_xref == undefined) return;

            let the_draw_sku_xref = el_option.attribs['data-thedrawskuxref'];
            if(the_draw_sku_xref == undefined) return;

            let size_name = el_option.attribs['data-value'];
            if(size_name == undefined) return;

            let friendly_size_name = el_option.attribs['data-friendly-name'];
            if(friendly_size_name == undefined) return;

            let size_info_obj = common.get_size_info_obj_scheme();
            common.update_size_info_obj(size_info_obj, 'name', size_name);
            common.update_size_info_obj(size_info_obj, 'friendly_name', friendly_size_name);
            common.update_size_info_obj(size_info_obj, 'sku_id', sku_id);
            common.update_size_info_obj(size_info_obj, 'external_id', external_id);
            common.update_size_info_obj(size_info_obj, 'draw_product_xref', the_draw_product_xref);
            common.update_size_info_obj(size_info_obj, 'draw_sku_xref', the_draw_sku_xref);

            size_info_list.push(size_info_obj);
        });

        return size_info_list;
        
    }catch(e){
        log.error(common.get_log_str('product_page_parser.js', 'parse_draw_size_info_list_from_product_page', e));
        return size_info_list;
    }
    
}

function parse_draw_id_from_from_product_page($){
    let el_option_list_draw_product = $('*[data-thedrawid]');
    if(el_option_list_draw_product.length == 0) return undefined;
    return el_option_list_draw_product[0].attribs['data-thedrawid'];
}

function update_product_info_as_sku_inventory_info(product_info, sku_inventory_info){

    common.update_product_info_obj(product_info, 'soldout', !sku_inventory_info.usable);

    let _size_info_list = [];
    
    sku_inventory_info.skuPricing.forEach((size_info) =>{
        
        let size_info_obj = common.get_size_info_obj_scheme();

        let external_id_array = size_info['externalId'].split('  ');

        let _external_id = external_id_array[0];
        let _name = external_id_array[1];
        let _sku_id = size_info['skuId'];
        let _price = size_info['price'];
        let _quantity = size_info['quantity'];
        let _id = size_info['selectedOptions'][0];

        common.update_size_info_obj(size_info_obj, 'external_id', _external_id);
        common.update_size_info_obj(size_info_obj, 'name', _name);
        common.update_size_info_obj(size_info_obj, 'sku_id', _sku_id);
        common.update_size_info_obj(size_info_obj, 'price', _price);
        common.update_size_info_obj(size_info_obj, 'quantity', _quantity);
        common.update_size_info_obj(size_info_obj, 'id', _id);

        if(product_info.product_options != undefined){

            for(var i = 0; i < product_info.product_options.length; i++){
                
                let product_option = product_info.product_options[i];
                if(product_option.allowedValues == undefined) continue;
                
                let found = false;

                for(var j = 0; product_option.allowedValues.length; j++){

                    let allowed_value = product_option.allowedValues[j];

                    if(allowed_value.id == _id){
                        common.update_size_info_obj(size_info_obj, 'name', allowed_value.value);
                        common.update_size_info_obj(size_info_obj, 'friendly_name', allowed_value.friendlyName);
                        found =  true;
                        break;
                    }
                }

                if(found) break;
            }
        }

        _size_info_list.push(size_info_obj);
    });

    common.update_product_info_obj(product_info, 'size_info_list', _size_info_list);
}


function parse_product_name_from_new_released_product_page($){
    try{
        const el_title_wrap = $('.title-wrap');
        if(el_title_wrap.length === 0) return undefined;
        const el_span_title = parser_common.get_specific_tag_nodes(el_title_wrap[0], ['span']);
        if(el_span_title.length === 0) return undefined;

        return el_span_title[0].attribs['data-name'];


    }catch(err){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_name_from_new_released_product_page', err));
        return undefined;
    }
}

function parse_model_id_from_new_released_product_page($){
    try{

        const el_span_data_model = $('span[data-model]');
        if(el_span_data_model.length === 0) return undefined;
        return el_span_data_model[0].attribs['data-model'];

    }catch(err){
        log.error(common.get_log_str('product_page_parser.js', 'parse_model_id_from_new_released_product_page', err));
        return undefined;
    }
}

function parse_product_price_from_new_released_product_page($){
    try{

        const el_strong_data_price = $('strong[data-price]');
        if(el_strong_data_price.length === 0) return undefined;

        const price_text_info = parser_common.get_specific_child_text_nodes(el_strong_data_price[0]);
        if(price_text_info.length == 0) return undefined;

        return price_text_info[0].data.trim();

    }catch(err){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_price_from_new_released_product_page', err));
        return undefined;
    }
}

function parse_product_id_from_new_released_product_page($){
    try{
        const el_div_data_product_id = $('div[data-product-id]');
        if(el_div_data_product_id.length === 0) return undefined;

        return el_div_data_product_id[0].attribs['data-product-id'];

    }catch(err){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_id_from_new_released_product_page', err));
        return undefined;
    }
}

function parse_product_options_from_new_released_product_page($){
    try{
        const el_div_data_product_options = $('div[data-product-options]');
        if(el_div_data_product_options.length === 0) return undefined;

        return JSON.parse(el_div_data_product_options[0].attribs['data-product-options']);

    }catch(err){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_options_from_new_released_product_page', err));
        return undefined;
    }
}

function parse_product_img_url_from_new_released_product_page($){
    try{
        const el_img_data_product_img = $('img[data-product-image]');
        if(el_img_data_product_img.length === 0) return undefined;

        return el_img_data_product_img[0].attribs['src'];

    }catch(err){
        log.error(common.get_log_str('product_page_parser.js', 'parse_product_img_url_from_new_released_product_page', err));
        return undefined;
    }
}


/**
 * new release page에서 상품 정보들을 파싱하여 product list info로 반환합니다.
 * 
 * @param {object} $ parsed new release web page object
 * @param {boolean} replace_url 상품 url을 '/kr/ko_kr/'에서 '/kr/launch/'로 대체시킬지 여부
 * @returns {object} new release page에서 파싱된 product info 리스트
 */
function parse_product_list_from_new_released_page($, replace_url){
    const product_list_divs = $('.a-product');

    if(product_list_divs.length === 0) return [];

    const product_info_list = [];

    product_list_divs.each((idx, product_info_div)=>{
        //get product
        try{
            const product_info = common.get_product_info_obj_scheme();
            common.update_product_info_obj(product_info, 'category', 'new_released');
            common.update_product_info_obj(product_info, '_id', common.uuidv4());
    
            // TODO : [주의] 현재는 확인 불가하지만 Notify Me로 등장하는 것들이 있음. Notify me의 경우 normal type이 될 수 없음.
            common.update_product_info_obj(product_info, 'sell_type', common.SELL_TYPE.normal);
    
            const el_name_inputs = parser_common.get_specific_tag_nodes(product_info_div, ['input'], [], ['name']);
            el_name_inputs.forEach((el_name_input)=>{
                if(el_name_input.attribs.name === 'productId'){
                    common.update_product_info_obj(product_info, 'product_id', el_name_input.attribs.value);
                }else if(el_name_input.attribs.name === 'producturl'){
                    let product_url = el_name_input.attribs.value;
                    if(replace_url) product_url = product_url.replace('/kr/ko_kr/', '/kr/launch/');
                    common.update_product_info_obj(product_info, 'url', common.NIKE_URL + product_url);
                }else if(el_name_input.attribs.name === 'productmodel'){
                    common.update_product_info_obj(product_info, 'model_id', el_name_input.attribs.value);
                }
            });
    
            const el_title_span = parser_common.get_specific_tag_nodes(product_info_div, [], ['item-title']);
            let product_name = parser_common.get_specific_child_text_nodes(el_title_span[0])[0].data.trim();
            product_name = parser_common.strip_useless_string(product_name)
            common.update_product_info_obj(product_info, 'name', product_name);
    
            const el_category_a = parser_common.get_specific_tag_nodes(product_info_div, [], ['a-product-image-link']);
            const item_attr_name = el_category_a[0].attribs.productcategory;
            const item_attr = `itemAttributes[${item_attr_name}_SIZE]`;
            common.update_product_info_obj(product_info, 'item_attr', item_attr);
    
            const el_price_p = parser_common.get_specific_tag_nodes(product_info_div, [], ['product-display-price'], []);
            const price = parser_common.get_specific_child_text_nodes(el_price_p[0])[0].data.trim();
            common.update_product_info_obj(product_info, 'price', price);
            
            const el_soldout_bedge_div = parser_common.get_specific_tag_nodes(product_info_div, [], ['product-soldout-badge'], []);
            const soldout = el_soldout_bedge_div[0].attribs.class.includes('isActive');
            common.update_product_info_obj(product_info, 'soldout', soldout);
    
            const el_proudct_img = parser_common.get_specific_tag_nodes(product_info_div, ['img'], [], []);
            const proudct_img_url = el_proudct_img[1].attribs.src;
            common.update_product_info_obj(product_info, 'img_url', proudct_img_url);
    
            common.update_product_info_obj(product_info, 'released_date', new Date());

            //parse cnadidate color products
            const el_sub_color_list = parser_common.get_specific_tag_nodes(product_info_div, ['li']);

            // sub color들에대한 상품 정보들을 파싱한다.
            const sub_product_info_list = parse_sub_color_product_info_list(el_sub_color_list, product_info);
            if(sub_product_info_list.length > 0){

                sub_product_info_list.forEach((sub_product_info) =>{
                    product_info_list.push(sub_product_info);
                });

            }else{
                product_info_list.push(product_info);
            }

        }catch(err){
            log.error(common.get_log_str('product_page_parser.js', 'parse_product_list_from_new_released_page', err));
        }
        
    });

    return product_info_list;
}

/**
 * new release page에 있는 하나의 product info feed elemnet에 속한 sub color html element object로부터 
 * 여러 색상의 상품 정보를 취득하여 product info를 파싱합니다
 * 
 * @param {object} el_sub_color_list sub color 상품 정보를 포함하고 있는 html element 객체
 * @param {object} representative_product_info main 제품 으로 표현 중인 상품 정보에 대한 객체
 */
function parse_sub_color_product_info_list(el_sub_color_list, representative_product_info){

    const sub_product_info_list = [];

    el_sub_color_list.forEach((el_sub_color_info)=>{

        const sub_color_product_info = _.clone(representative_product_info);

        const el_a_input_radio = parser_common.get_specific_tag_nodes(el_sub_color_info, ['a']);
        const sub_color_product_url = common.NIKE_URL + el_a_input_radio[0].attribs.href;
        common.update_product_info_obj(sub_color_product_info, 'url', sub_color_product_url);

        const model_id_regex = /[A-Z0-9]{6}-[0-9]{3}/;
        const model_id = model_id_regex.exec(sub_color_product_url)[0];
        common.update_product_info_obj(sub_color_product_info, 'model_id', model_id);

        const soldout = el_sub_color_info.attribs.class.includes('isSoldout');
        common.update_product_info_obj(sub_color_product_info, 'soldout', soldout);

        const el_product_img = parser_common.get_specific_tag_nodes(el_sub_color_info, ['img']);
        const img_url = el_product_img[0].attribs.src;
        common.update_product_info_obj(sub_color_product_info, 'img_url', img_url);

        common.update_product_info_obj(sub_color_product_info, 'product_id', undefined);
        common.update_product_info_obj(sub_color_product_info, '_id', common.uuidv4()); // TODO update model_id

        sub_product_info_list.push(sub_color_product_info);

    }); // 한 item이지만 복수개의 색상이 존재하는 제품에 대한 처리이다.

    return sub_product_info_list;
}


module.exports.get_product_list_info_from_feed_page = get_product_list_info_from_feed_page;
module.exports.get_product_info_from_product_page = get_product_info_from_product_page;
module.exports.update_product_info_as_sku_inventory_info = update_product_info_as_sku_inventory_info;
module.exports.parse_product_list_from_new_released_page = parse_product_list_from_new_released_page;