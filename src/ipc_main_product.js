const {ipcMain} = require("electron");
const BrowserContext = require("./api/browser_context.js").BrowserContext;

function register(){

    ipcMain.on('get-product-info-list', (event, data) => {

        let browser_context = new BrowserContext();

        (async () => {
            const product_info_list = await browser_context.open_feed_page();
            if(product_info_list == undefined){
                event.reply('get-product-info-list-reply' + data.id, {err : 'Cannot open product feed page', data : undefined});
            }else{
                event.reply('get-product-info-list-reply' + data.id, {err : undefined, data : product_info_list});
            }
        })();
    });

    ipcMain.on('get-product-info', async (event, data) => {

        let browser_context = new BrowserContext();
        const product_url = data.payload.product_url;
        
        (async () => {
            const product_info = await browser_context.open_product_page(product_url);
            if(product_info == undefined){
                event.reply('get-product-info-reply' + data.id, {err : 'Cannot open product page', data : undefined});
            }else{
                event.reply('get-product-info-reply' + data.id, {err : undefined, data : product_info});
            }
        })();
    });

}


module.exports.register = register;