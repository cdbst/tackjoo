const {ipcMain} = require("electron");
const BrowserContext = require("../api/browser_context.js").BrowserContext;
const BrowserContextManager = require("../api/browser_context_mngr.js").BrowserContextManager;
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

    ipcMain.on('load-exclusive-info-list', async (event, data) => {

        const exclusive_url = data.payload.exclusive_url;

        (async ()=>{
            try{
                const browser_context_list = BrowserContextManager.get_all_browser_contexts();
                const exclusive_info_list_promise_list = [];

                for(var i = 0; i < browser_context_list.length; i++){
                    const browser_context = browser_context_list[i];
                    const p_exclusive_info_list = get_exclusive_list_info(browser_context, exclusive_url);
                    exclusive_info_list_promise_list.push(p_exclusive_info_list);
                    await common.async_sleep(1000);
                }

                const results = await Promise.all(exclusive_info_list_promise_list);
                const errors = [];
                const exclusive_item_list = [];

                results.forEach((result)=>{
                    if(result.error !== undefined) errors.push(result.error);
                    if(result.data !== undefined) exclusive_item_list.push(result.data);
                })
    
                event.reply('load-exclusive-info-list-reply' + data.id, {err : errors.join('\n'), data : exclusive_item_list});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'load-exclusive-info-list-callback', err));
                event.reply('load-exclusive-info-list-reply' + data.id, {err : err.message});
            }
        })();
    });
}

async function get_exclusive_list_info(browser_context, exclusive_url){

    let result = await browser_context.login(5);
    if(result === false) return {error : `로그인 실패 : ${browser_context.email}`, data : undefined};

    let product_info = await browser_context.open_exclusive_link(exclusive_url, 1);
    if(product_info === undefined) return {error : `미당첨 : ${browser_context.email}`, data : undefined};

    return {error : undefined, data : {
        product_info : product_info,
        account_email : browser_context.email
    }}
}

module.exports.register = register;