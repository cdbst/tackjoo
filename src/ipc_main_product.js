const {ipcMain} = require("electron");
const BrowserContext = require("./api/browser_context.js").BrowserContext;

function register(){

    ipcMain.on('get-product-info-list', (event, data) => {

        let browser_context = new BrowserContext();

        browser_context.open_feed_page((_err, product_list_info)=>{
            event.reply('get-product-info-list-reply' + data.id, {err : _err, data : product_list_info});
        });
    });

    ipcMain.on('get-product-info', async (event, data) => {

        let browser_context = new BrowserContext();
        let product_url = data.payload.product_url;

        try{
            let product_info = await browser_context.open_product_page(product_url);
            event.reply('get-product-info-reply' + data.id, {err : undefined, data : product_info});
        }catch(e){
            event.reply('get-product-info-reply' + data.id, {err : e, data : undefined});
        }
    });

}


module.exports.register = register;