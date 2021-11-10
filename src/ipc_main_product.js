const {ipcMain} = require("electron");
const BrowserCxt = require("./api/browser_context.js");

const common = require('./common/common.js');
const product_page_parser = require('./api/product_page_parser.js');

function register(){

    ipcMain.on('get-product-info-list', (event, data) => {

        let browser_cxt = new BrowserCxt.BrowserContext();

        browser_cxt.open_feed_page((_err, product_list_info)=>{
            event.reply('get-product-info-list-reply' + data.id, {err : _err, data : product_list_info});
        });
    });

    ipcMain.on('get-product-info', (event, data) => {

        let browser_cxt = new BrowserCxt.BrowserContext();
        let product_url = data.payload.product_url;

        browser_cxt.open_product_page(product_url, (_err, product_info) =>{

            if(_err){
                event.reply('get-product-info-reply' + data.id, {err : _err, data : undefined});
                return;
            }

            event.reply('get-product-info-reply' + data.id, {err : undefined, data : product_info});
        });
    });

}


module.exports.register = register;