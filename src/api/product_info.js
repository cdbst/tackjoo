const { v4: uuidv4 } = require('uuid');

let get_products_info_from_feed_page = ($) => {

    let product_list = [];

    $('.launch-list-item').each((idx, el)=>{

        let maybe_meaningful_nodes = get_specific_tag_nodes(el, ['a', 'img']);

        let product_alt_name = undefined;
        let product_name = undefined;
        let product_type_text = undefined;
        let product_url = undefined;
        let product_img_url = undefined;
        

        for(var i = 0; i < maybe_meaningful_nodes.length; i++){
            let maybe_meaningful_node = maybe_meaningful_nodes[i];

            if(maybe_meaningful_node.name == 'img'){
                product_url = maybe_meaningful_node.attribs['data-src'];
                product_alt_name = maybe_meaningful_node.attribs.alt;
            }else if(maybe_meaningful_node.name == 'a' && has_class(maybe_meaningful_node, ['card-link'])){
                product_img_url = maybe_meaningful_node.attribs.href;
                product_name = maybe_meaningful_node.attribs.title;
            }else if(maybe_meaningful_node.name == 'a' && has_specific_attrs(maybe_meaningful_node, {'data-qa' : ['theme-feed'] })){
                product_type_text = maybe_meaningful_node.childNodes[0].data;
            }
        }
        
        if(product_type_text == undefined) return;

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

module.exports.get_products_info_from_feed_page = get_products_info_from_feed_page;