const { Notification, app } = require("electron");
const path = require('path');

module.exports.notify_new_product = (product_info, __on_click_cb)=>{
    
    const notification = new Notification({
        title: '새로운 상품 등록을 확인했습니다.',
        subtitle : product_info.name,
        body: `${product_info.name}(${product_info.model_id})\n${product_info.price}`,
        silent: false,
        icon: path.resolve(path.join(app.getAppPath(), 'res', 'img', 'icon.ico'))
    });

    notification.on('click', __on_click_cb);
    notification.show();
    
}