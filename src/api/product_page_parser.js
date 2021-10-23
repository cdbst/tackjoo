const common = require('../common/common.js');

function strip_usless_string(string){
    return string.replace(/(\t|\n)/gi, '').trim();
}

function get_product_type(product_type_string){

    let product_type = undefined;

    let text = strip_usless_string(product_type_string).toLowerCase();

    if(text.includes(common.PRODUCT_TYPE.normal)){
        product_type = common.PRODUCT_TYPE.normal;
    }else if(text.includes(common.PRODUCT_TYPE.ftfs)){
        product_type = common.PRODUCT_TYPE.ftfs;
    }else if(text.includes(common.PRODUCT_TYPE.draw)){
        product_type = common.PRODUCT_TYPE.draw;
    }

    return product_type;

}

function estimate_open_year(month){

    //시작 date 정보에 year 정보가 없으므로 현재 날짜를 구해와서, open_month 가 현재 month보다 이전이면 open year을 내년으로 취급한다.
    let today = new Date();
    let cur_month = today.getMonth() + 1; //return range is (0 ~ 11)

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
        let sell_type = get_product_type(sell_type_text);
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
        common.update_product_info_obj(_product_info, 'sold_out', true);
        return _product_info;
    }else{
        common.update_product_info_obj(_product_info, 'sold_out', false);
    }

    //STEP-1 price info를 파싱한다.
    let price = parse_price_from_product_page($);
    if(price == undefined) return undefined;
    common.update_product_info_obj(_product_info, 'price', price);

    //STEP0 product id 를 파싱해야한다.
    let product_id = parse_product_id_from_product_page($);
    if(product_id == undefined) return undefined;
    common.update_product_info_obj(_product_info, 'product_id', product_id);

    //STEP1 버튼 상태를 보고 이 상품 페이지가 DRAW인지 선착순인지 일반 구매 상품인지 구별한다.
    let product_type = parse_product_type_from_product_page($);

    if(product_type == undefined || product_type != common.PRODUCT_TYPE.normal){
        //TODO : STEP2 지금 당장 구매 불가능한 상품의 경우 제품의 판매 시작 시간, 판매 종료 시간을 취득한다.

        if(product_type == common.PRODUCT_TYPE.draw){
            //TODO 작업 진행 상황
            let draw_time_info = parse_draw_time_from_product_page($);
            if(draw_time_info == undefined) return undefined;

            common.update_product_info_obj(_product_info, 'open_time', draw_time_info.open);
            common.update_product_info_obj(_product_info, 'close_time', draw_time_info.close);

        }else if(product_type == common.PRODUCT_TYPE.ftfs){
            let open_time = parse_ftfs_time_from_product_page($);

            if(open_time == undefined) return undefined;
            common.update_product_info_obj(_product_info, 'open_time', open_time);
        }

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

        let draw_month = parseInt(draw_date_info.split('/')[0]);
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
        
        let open_month = parseInt(open_time_text_arr[0]);
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

function parse_product_type_from_product_page($){

    let el_order_btn = $('.draw-button');
    if(el_order_btn.length == 0) return undefined;

    let el_order_btn_text = get_specific_child_text_nodes(el_order_btn[0]);
    if(el_order_btn_text.length == 0) return undefined;

    let product_type = undefined;

    for(var i = 0; i < el_order_btn_text.length; i++){
        let text = strip_usless_string(el_order_btn_text[i].data).toLowerCase();

        if(text.includes(common.PRODUCT_TYPE.normal)){
            product_type = common.PRODUCT_TYPE.normal;
        }else if(text.includes(common.PRODUCT_TYPE.ftfs)){
            product_type = common.PRODUCT_TYPE.ftfs;
        }else if(text.includes(common.PRODUCT_TYPE.draw)){
            product_type = common.PRODUCT_TYPE.draw;
        }

        if(product_type != undefined) break;
    }

    return product_type;
}


module.exports.get_product_list_info_from_feed_page = get_product_list_info_from_feed_page;
module.exports.get_product_info_from_product_page = get_product_info_from_product_page;