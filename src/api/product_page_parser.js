const common = require('../common/common.js');

function strip_usless_string(string){
    return string.replace(/(\t|\n)/gi, '').trim();
}

function get_sell_type(sell_type_string){

    let sell_type = undefined;

    let text = strip_usless_string(sell_type_string).toLowerCase();

    if(text.includes(common.SELL_TYPE.normal.toLowerCase())){
        sell_type = common.SELL_TYPE.normal;
    }else if(text.includes(common.SELL_TYPE.ftfs.toLowerCase())){
        sell_type = common.SELL_TYPE.ftfs;
    }else if(text.includes(common.SELL_TYPE.draw.toLowerCase())){
        sell_type = common.SELL_TYPE.draw;
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

        let maybe_meaningful_nodes = get_specific_tag_nodes(el, ['a', 'img', 'div']);

        let product_alt_name = undefined;
        let product_name = undefined;
        let sell_type_text = undefined;
        let product_url = undefined;
        let product_img_url = undefined;
        
        for(var i = 0; i < maybe_meaningful_nodes.length; i++){
            let maybe_meaningful_node = maybe_meaningful_nodes[i];

            if(maybe_meaningful_node.name == 'img'){
                product_img_url = maybe_meaningful_node.attribs['data-src'];
                product_alt_name = maybe_meaningful_node.attribs.alt;
            }else if(maybe_meaningful_node.name == 'a' && has_class(maybe_meaningful_node, ['card-link'])){
                product_url = common.NIKE_URL + maybe_meaningful_node.attribs.href;
                product_name = maybe_meaningful_node.attribs.title;
            }else if(maybe_meaningful_node.name == 'a' && has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                sell_type_text = maybe_meaningful_node.childNodes[0].data;
            }else if(maybe_meaningful_node.name == 'div' && has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                sell_type_text = maybe_meaningful_node.childNodes[0].data;
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

        product_list.push(product_info);
    });

    return product_list;
}

function get_specific_tag_nodes (element, tags, class_names = [], data_attrs = {}) {

    let specific_childs = [];
    let node_stack = [];

    node_stack.push(element);

    while(node_stack.length > 0){

        let cur_node = node_stack.pop();

        if(cur_node.childNodes == undefined) continue;

        for(var i = 0; i < cur_node.childNodes.length; i++){

            let child_node = cur_node.childNodes[i];
            node_stack.push(child_node);

            if(child_node.type != 'tag') continue;

            if(tags.includes(child_node.name) || has_class(child_node, class_names) || has_specific_attrs(child_node, data_attrs)){
                specific_childs.push(child_node);
            }
        }
    }

    return specific_childs;
}

function has_class(el, class_names){
    if(el.attribs.class == undefined) return false;

    let el_classes = el.attribs.class.split(' ');

    let intersection = el_classes.filter((el_class) =>{
        return class_names.includes(el_class);
    });

    return intersection.length != 0;
}

function has_specific_attrs(el, attr){
    let attr_names = Object.keys(attr);

    for(var i = 0; i < attr_names.length; i++){
        let attr_name = attr_names[i];
        let attr_values = attr[attr_name];

        if(attr_name in el.attribs == false) continue;

        let el_attr_values = el.attribs[attr_name].split(' ');

        let intersection = el_attr_values.filter((el_attr_value) =>{
            return attr_values.includes(el_attr_value);
        });

        if(intersection.length > 0) return true;
    }

    return false;
}

function get_specific_child_text_nodes (element, text_data = undefined) {

    let specific_childs = [];
    let node_stack = [];

    node_stack.push(element);

    while(node_stack.length > 0){

        let cur_node = node_stack.pop();

        if(cur_node.childNodes == undefined) continue;

        for(var i = 0; i < cur_node.childNodes.length; i++){

            let child_node = cur_node.childNodes[i];
            node_stack.push(child_node);

            if(child_node.type != 'text') continue;

            if(text_data == undefined || child_node.data == text_data){
                specific_childs.push(child_node);
            }
            
        }
    }

    return specific_childs;
}

function get_product_info_from_product_page ($) {

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

    
    let product_id = parse_product_id_from_product_page($);
    if(product_id == undefined) return undefined;
    common.update_product_info_obj(_product_info, 'product_id', product_id);

    
    let sell_type = parse_sell_type_from_product_page($);
    common.update_product_info_obj(_product_info, 'sell_type', sell_type);

    if(sell_type == common.SELL_TYPE.draw){
        let draw_time_info = parse_draw_time_from_product_page($);
        if(draw_time_info == undefined) return undefined;

        common.update_product_info_obj(_product_info, 'open_time', draw_time_info.open);
        common.update_product_info_obj(_product_info, 'close_time', draw_time_info.close);

        //draw_id와 size_info_list 정보는 draw open 시간일 때만 확인이 가능함.
        let draw_id = parse_draw_id_from_from_product_page($);
        common.update_product_info_obj(_product_info, 'draw_id', draw_id);

        let size_info_list = parse_draw_size_info_list_from_product_page($);
        common.update_product_info_obj(_product_info, 'size_info_list', size_info_list);

    }else if(sell_type == common.SELL_TYPE.ftfs){
        let open_time = parse_ftfs_time_from_product_page($);

        if(open_time == undefined) return undefined;
        common.update_product_info_obj(_product_info, 'open_time', open_time);

    }else if(sell_type = common.SELL_TYPE.normal){
    
    }else{
        //TODO : _product_info를 return할지 아니면 undefiend를 return할지 좀 더 고민 필요.
        return undefined;
    }

    return _product_info;
}

function parse_price_from_product_page($){
    try{
        let el_price_info_div = $('div.headline-5.pb6-sm.fs14-sm.fs16-md');
        if(el_price_info_div.length == undefined) return undefined;

        let price_info_text = get_specific_child_text_nodes(el_price_info_div[0]);

        if(price_info_text.length == 0) return undefined;

        return price_info_text[0].data.trim();
        
    }catch(e){
        return undefined;
    }
}

function parse_draw_time_from_product_page($){
    
    try{

        let el_p_draw_info = $('.draw-info');

        if(el_p_draw_info.length == 0) return;
        
        let text_draw_info = get_specific_child_text_nodes(el_p_draw_info[0]);

        if(text_draw_info.length == 0){
            return;
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
        return undefined;
    }
}

function parse_ftfs_time_from_product_page($){
    try{
        let el_div_open_time_info = $('.available-date-component');

        if(el_div_open_time_info.length == 0) return undefined;

        let el_open_time_text = get_specific_child_text_nodes(el_div_open_time_info[0]);

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
        return undefined;
    }
}

function parse_product_id_from_product_page($){

    let product_id = undefined;
    let scripts = $('script:not([src])');

    scripts.each((idx, script) =>{
        if(Object.keys(script.attribs).length != 0) return;
        if(script.childNodes.length != 1) return;

        let script_code = script.childNodes[0].data;

        if(script_code.includes('categoryInfo =') == false) return;
        script_code = strip_usless_string(script_code);

        product_id = script_code.split('var productInfo = {')[1].split(',', 1)[0].replace('id : ', '');
    });

    return product_id;
}

function parse_sell_type_from_product_page($){

    let el_order_btn = $('.draw-button');
    if(el_order_btn.length == 0) return undefined;

    let el_order_btn_text = get_specific_child_text_nodes(el_order_btn[0]);
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

            let size_info_obj = common.get_size_info_obj_scheme();
            common.update_size_info_obj(size_info_obj, 'name', size_name);
            common.update_size_info_obj(size_info_obj, 'sku_id', sku_id);
            common.update_size_info_obj(size_info_obj, 'external_id', external_id);
            common.update_size_info_obj(size_info_obj, 'draw_product_xref', the_draw_product_xref);
            common.update_size_info_obj(size_info_obj, 'draw_sku_xref', the_draw_sku_xref);

            size_info_list.push(size_info_obj);
        });

        return size_info_list;
        
    }catch(e){
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

        _size_info_list.push(size_info_obj);
    });

    common.update_product_info_obj(product_info, 'size_info_list', _size_info_list);
}


module.exports.get_product_list_info_from_feed_page = get_product_list_info_from_feed_page;
module.exports.get_product_info_from_product_page = get_product_info_from_product_page;
module.exports.update_product_info_as_sku_inventory_info = update_product_info_as_sku_inventory_info;