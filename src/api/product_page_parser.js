const common = require('../common/common.js');
const parser_common = require('./page_parser_common');
const log = require('electron-log');

function get_sell_type(sell_type_string){

    let sell_type = undefined;

    let text = parser_common.strip_usless_string(sell_type_string).toLowerCase();

    if(text.includes(common.SELL_TYPE.normal.toLowerCase())){
        sell_type = common.SELL_TYPE.normal;
    }else if(text.includes(common.SELL_TYPE.ftfs.toLowerCase())){
        sell_type = common.SELL_TYPE.ftfs;
    }else if(text.includes(common.SELL_TYPE.draw.toLowerCase())){
        sell_type = common.SELL_TYPE.draw;
    }else if(text.includes(common.SELL_TYPE.notify.toLowerCase())){
        sell_type = common.SELL_TYPE.notify;
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

function get_product_info_from_product_page ($) {

    try{
        let _product_info = common.get_product_info_obj_scheme();

        if($('.product-soldout').length > 0){
            common.update_product_info_obj(_product_info, 'soldout', true);
            return _product_info;
        }else{
            common.update_product_info_obj(_product_info, 'soldout', false);
        }
        
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
        log.error(common.get_log_str('product_page_parser.js', 'get_product_info_from_product_page', e));
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
    script_code = parser_common.strip_usless_string(script_code);

    let product_id = script_code.split('var productInfo = {')[1].split(',', 1)[0].replace('id : ', '');
    return product_id;
}

function parse_model_id_from_product_page(product_info_script){

    let script_code = product_info_script.childNodes[0].data;
    script_code = parser_common.strip_usless_string(script_code);

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


module.exports.get_product_list_info_from_feed_page = get_product_list_info_from_feed_page;
module.exports.get_product_info_from_product_page = get_product_info_from_product_page;
module.exports.update_product_info_as_sku_inventory_info = update_product_info_as_sku_inventory_info;