const {ipcMain} = require("electron");
const BrowserContext = require("../api/browser_context.js").BrowserContext;
const NewReleasedProductWatchdog = require('../api/new_released_product_watchdog').NewReleasedProductWatchdog;
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

    let product_watchdog = null;

    ipcMain.on('start-watching-new-released', (event, data) =>{

        const settings_info = data.payload.settings_info;
        product_watchdog = new NewReleasedProductWatchdog(settings_info.new_product_watch_interval, settings_info.new_product_watch_max_ret);
       
        (async()=>{
            try{
                await product_watchdog.start_watch((new_product_list)=>{
                    event.reply('start-watching-new-released-reply' + data.id, {stop : false, product_info_list : new_product_list}); // watchdog이 정상 동작하는 것을 알려주기 위한 ipc 통신임.
                });   
            }catch(err){
                log.error(common.get_log_str('ipc_main_product.js', 'start-watching-new-released-callback', err));
            }finally{
                product_watchdog = null;
                event.reply('start-watching-new-released-reply' + data.id, {stop : true, product_info_list : undefined}); // watchdog이 중지됐을 때 ipc로 중지 상태임을 알린다.
            }
        })();

        event.reply('start-watching-new-released-reply' + data.id, {stop : false, product_info_list : undefined}); // watchdog이 정상 동작하는 것을 알려주기 위한 ipc 통신임.
    });

    ipcMain.on('stop-watching-new-released', async(event, data) =>{
        if(product_watchdog !== null){
            product_watchdog.stop_watch();
        }
    });

    ipcMain.on('get-kream-trade-price', async(event, data) =>{

        const product_info = data.payload.product_info;
        
        (async()=>{
            try{
                const kream_product_info = await get_kream_product_info(product_info);
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