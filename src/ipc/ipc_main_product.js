const {ipcMain} = require("electron");
const BrowserContext = require("../api/browser_context.js").BrowserContext;
const { get_kream_product_info } = require('../api/kream_mngr');

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('get-product-info-list', (event, data) => {

        let browser_context = new BrowserContext();

        (async () => {
            const product_info_list = await browser_context.open_feed_page();
            if(product_info_list == undefined){
                log.error(common.get_log_str('ipc_main_product.js', 'get-product-info-list-callback', 'Cannot open product feed page'));
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

            const product_info = await browser_context.open_product_page(product_url, 2);
            if(product_info == undefined){
                log.error(common.get_log_str('ipc_main_product.js', 'get-product-info-callback', 'Cannot open product page'));
                event.reply('get-product-info-reply' + data.id, {err : 'Cannot open product page', data : undefined});
            }else{
                event.reply('get-product-info-reply' + data.id, {err : undefined, data : product_info});
            }
        })();
    });

    ipcMain.on('get-kream-trade-price', async(event, data) =>{

        const model_id = data.payload.model_id;
        
        (async()=>{
            try{
                const kream_product_info = await get_kream_product_info(model_id);
                if(kream_product_info === undefined){
                    event.reply('get-kream-trade-price-reply' + data.id, {err : '크림에서 가격정보를 찾을수 없습니다.', data : undefined});
                }else{
                    event.reply('get-kream-trade-price-reply' + data.id, {err : undefined, data : kream_product_info});
                }
            }catch(err){
                log.error(common.get_log_str('ipc_main_product.js', 'get-kream-trade-price-callback', err));
                event.reply('get-kream-trade-price-reply' + data.id, {err : err.message, data : undefined});
            }
        })();
        
    });
}


module.exports.register = register;