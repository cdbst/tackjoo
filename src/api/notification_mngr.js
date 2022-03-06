const { app, Notification } = require("electron");
const path = require('path');
const common = require('../common/common');

const notifier_queue = {}

module.exports.notify_new_product = (product_info)=>{
    
    const title = '새로운 상품 등록을 확인했습니다.';
    const body = `${product_info.name}(${product_info.model_id})\n${product_info.price}`;

    return this.notify_text(title, body);
}

module.exports.notify_new_product_list = (product_info_list)=>{

    if(product_info_list.length === 0) throw new Error('product info list is empty');

    const main_product_info = product_info_list[0];

    const title = `새로운 ${product_info_list.length}개의 상품 등록을 확인했습니다.`;
    let body = '';

    if(product_info_list.length === 1){
        body = `${main_product_info.name}(${main_product_info.model_id})\n${main_product_info.price}`
    }else{
        body = `${main_product_info.name}등 ${product_info_list.length}개`
    }

    return this.notify_text(title, body);
}

module.exports.set_taskbar_flash = (setting) => {
    if(setting) app.main_browser_window.once('focus', ()=> app.main_browser_window.flashFrame(false));
    app.main_browser_window.flashFrame(setting);
}

module.exports.notify_text = (title, message)=>{

    const notifier = new Notification({
        title: title,
        body: message,
        icon : path.resolve(path.join(app.getAppPath(), 'res', 'img', 'icon.ico')),
        silent : false,
    });

    notifier.show();
    this.set_taskbar_flash(true);

    const notifier_id = common.uuidv4();
    notifier_queue[notifier_id] = notifier;
    notifier.once('close', ()=>{
        delete notifier[notifier_id];
    });
    notifier.once('click', ()=>{
        delete notifier[notifier_id];
    });


    return notifier;
}