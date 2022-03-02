const { Notification, app } = require("electron");
const path = require('path');

module.exports.notify_new_product = (product_info, __on_click_cb)=>{
    
    const notification = new Notification({
        title: '새로운 상품 등록을 확인했습니다.',
        body: `${product_info.name}(${product_info.model_id})\n${product_info.price}`,
        silent: false,
        icon: path.resolve(path.join(app.getAppPath(), 'res', 'img', 'icon.ico'))
    });

    notification.on('click', __on_click_cb);
    notification.show();
    
}

module.exports.notify_new_product_list = (product_info_list, __on_click_cb)=>{
    if(product_info_list.length === 0) throw new Error('product info list is empty');

    const main_product_info = product_info_list[0];
    let body_str = '';

    if(product_info_list.length === 1){
        body_str = `${main_product_info.name}(${main_product_info.model_id})\n${main_product_info.price}`
    }else{
        body_str = `${main_product_info.name}등 ${product_info_list.length}개`
    }
    
    const notification = new Notification({
        title: `새로운 ${product_info_list.length}개의 상품 등록을 확인했습니다.`,
        body: body_str,
        silent: false,
        icon: path.resolve(path.join(app.getAppPath(), 'res', 'img', 'icon.ico'))
    });

    notification.on('click', __on_click_cb);
    notification.show();
    
}