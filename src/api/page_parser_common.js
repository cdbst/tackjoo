
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

function get_data_tag_value($, tag_type, attr_name, attr_value = undefined){

    let sepecifier = attr_value == undefined ? attr_name : attr_name + '=' + attr_value;
    let selector = tag_type + '[' + sepecifier + ']';

    let data_el = $(selector);
    if(data_el.length == 0) return undefined;

    let data = data_el[0].attribs[attr_name];

    return data;
}

function get_data_tag_elem($, tag_type, attr_name, attr_value = undefined){

    let sepecifier = attr_value == undefined ? attr_name : attr_name + '=' + attr_value;
    let selector = tag_type + '[' + sepecifier + ']';

    let data_el = $(selector);
    if(data_el.length == 0) return undefined;

    return data_el[0];
}

function get_elem_attr_value(elem, attr_name){

    if(elem == undefined) return undefined;
    if(attr_name in elem.attribs == false) return undefined;

    return elem.attribs[attr_name];
}

module.exports.get_specific_child_text_nodes = get_specific_child_text_nodes;
module.exports.has_specific_attrs = has_specific_attrs;
module.exports.has_class = has_class;
module.exports.get_specific_tag_nodes = get_specific_tag_nodes;
module.exports.get_data_tag_value = get_data_tag_value;
module.exports.get_data_tag_elem = get_data_tag_elem;
module.exports.get_elem_attr_value = get_elem_attr_value;