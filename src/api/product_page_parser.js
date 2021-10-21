const NIKE_URL = 'https://www.nike.com';
const RESERVED_IDENTIFIERS = {normal : 'buy', ftfs :'coming soon', draw : 'the draw'};

function strip_usless_string(string){
    return string.replace(/(\t|\n)/gi, '').trim();
}

let get_product_list_info_from_feed_page = ($) => {

    let product_list = [];

    $('.launch-list-item').each((idx, el)=>{

        let maybe_meaningful_nodes = get_specific_tag_nodes(el, ['a', 'img', 'div']);

        let product_alt_name = undefined;
        let product_name = undefined;
        let product_type_text = undefined;
        let product_url = undefined;
        let product_img_url = undefined;
        
        for(var i = 0; i < maybe_meaningful_nodes.length; i++){
            let maybe_meaningful_node = maybe_meaningful_nodes[i];

            if(maybe_meaningful_node.name == 'img'){
                product_img_url = maybe_meaningful_node.attribs['data-src'];
                product_alt_name = maybe_meaningful_node.attribs.alt;
            }else if(maybe_meaningful_node.name == 'a' && has_class(maybe_meaningful_node, ['card-link'])){
                product_url = NIKE_URL + maybe_meaningful_node.attribs.href;
                product_name = maybe_meaningful_node.attribs.title;
            }else if(maybe_meaningful_node.name == 'a' && has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                product_type_text = maybe_meaningful_node.childNodes[0].data;
            }else if(maybe_meaningful_node.name == 'div' && has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                product_type_text = maybe_meaningful_node.childNodes[0].data;
            }
        }
        
        if(product_type_text == undefined) return;

        product_type_text = strip_usless_string(product_type_text)

        let result = is_valid_product(product_type_text);
        if(result == false) return;

        product_list.push({
            product_name : product_name,
            product_alt_name : product_alt_name,
            product_type_text : product_type_text,
            product_url : product_url,
            product_img_url : product_img_url
        });
    });

    return product_list;
}

function is_valid_product(product_type_text){
    let reserved_proudct_type_texts = { common : 'Buy',  fcfs : 'Coming Soon', draw : 'THE DRAW'};

    if(product_type_text == reserved_proudct_type_texts.common){
        return true;
    }

    if(product_type_text == reserved_proudct_type_texts.fcfs){
        return true;
    }

    if(product_type_text.includes(reserved_proudct_type_texts.draw)){
        return true;
    }

    return false;
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

    let product_info = {
        product_id : undefined
    };

    //STEP0 product id 를 파싱해야한다.
    let product_id = parse_product_id_from_product_page($);
    if(product_id == undefined) return undefined;

    //STEP1 버튼 상태를 보고 이 상품 페이지가 DRAW인지 선착순인지 일반 구매 상품인지 구별한다.
    let product_type = parse_product_type_from_product_page($);

    if(product_type == undefined || product_type != RESERVED_IDENTIFIERS.normal){
        //TODO : STEP2 지금 당장 구매 불가능한 상품의 경우 제품의 판매 시작 시간, 판매 종료 시간을 취득한다.

        if(product_type == RESERVED_IDENTIFIERS.draw){
            //TODO 작업 진행 상황
            parse_draw_time_from_product_page($);
        }else if(product_type == RESERVED_IDENTIFIERS.ftfs){

        }

        return product_info;
    } else{
        //TODO : STEP2 지금 당장 구매 가능한 상품의 경우 구매 가능한 사이즈를 찾는다. HTTP REQ (productSkuInventory)
    }

    return product_info;
}

function parse_draw_time_from_product_page($){
    let el_p_draw_info = $('.draw-info');

    if(el_p_draw_info.length == 0) return;
    
    let text_draw_info = get_specific_child_text_nodes(el_p_draw_info[0]);

    console.log('test');
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

        if(text.includes(RESERVED_IDENTIFIERS.normal)){
            product_type = RESERVED_IDENTIFIERS.normal;
        }else if(text.includes(RESERVED_IDENTIFIERS.ftfs)){
            product_type = RESERVED_IDENTIFIERS.ftfs;
        }else if(text.includes(RESERVED_IDENTIFIERS.draw)){
            product_type = RESERVED_IDENTIFIERS.draw;
        }

        if(product_type != undefined) break;
    }

    return product_type;
}


module.exports.get_product_list_info_from_feed_page = get_product_list_info_from_feed_page;
module.exports.get_product_info_from_product_page = get_product_info_from_product_page;