const {ipcMain} = require("electron");
const { NewReleasedProductWatchdog } = require('../api/new_released_product_watchdog');
const { USER_FILE_PATH } = require('../user_file_path.js');
const { UserFileManager } = require("../api/user_file_mngr.js");

const log = require('electron-log');
const common = require('../common/common');

function register(){

    let product_watchdog = null;

    ipcMain.on('start-watching-new-released', (event, data) =>{
        
        product_watchdog = new NewReleasedProductWatchdog(data.payload.settings_info);
       
        (async()=>{
            try{
                await product_watchdog.start_watch((new_product_list)=>{
                    event.reply('start-watching-new-released-reply' + data.id, {stop : false, product_info_list : new_product_list}); // watchdog이 정상 동작하는 것을 알려주기 위한 ipc 통신임.
                });   
            }catch(err){
                log.error(common.get_log_str('ipc_main_new_product.js', 'start-watching-new-released-callback', err));
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

    ipcMain.on('save-new-released-product-whitelist-info', async(event, data) =>{
        (async()=>{
            try{
                const whitelist_info = { whitelist_info : data.payload.whitelist_info };
            
                await UserFileManager.write(USER_FILE_PATH.NEW_RELEASED_PRODUCT_WHITELIST_INFO, whitelist_info);
                event.reply('save-new-released-product-whitelist-info-reply' + data.id, {err : undefined});
            }catch(err){
                log.error(common.get_log_str('ipc_main_new_product.js', 'save-new-released-product-whitelist-info-callback', err));
                event.reply('save-new-released-product-whitelist-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('load-new-released-product-whitelist-info', async(event, data) =>{
        (async()=>{
            try{
                const file_data = await UserFileManager.read(USER_FILE_PATH.NEW_RELEASED_PRODUCT_WHITELIST_INFO);
                event.reply('load-new-released-product-whitelist-info-reply' + data.id, {err : undefined, data : file_data.whitelist_info});
            }catch(err){
                log.error(common.get_log_str('ipc_main_new_product.js', 'load-new-released-product-whitelist-info-callback', err));
                event.reply('load-new-released-product-whitelist-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('save-new-released-product-blacklist-info', async(event, data) =>{
        (async()=>{
            try{
                const blacklist_info = { blacklist_info : data.payload.blacklist_info };
            
                await UserFileManager.write(USER_FILE_PATH.NEW_RELEASED_PRODUCT_BLACKLIST_INFO, blacklist_info);
                event.reply('save-new-released-product-blacklist-info-reply' + data.id, {err : undefined});
            }catch(err){
                log.error(common.get_log_str('ipc_main_new_product.js', 'save-new-released-product-blacklist-info-callback', err));
                event.reply('save-new-released-product-blacklist-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('save-new-released-product-custom-watch-page-list-info', async(event, data) =>{
        (async()=>{
            try{
                const custom_watch_page_list_info = { custom_watch_page_list_info : data.payload.custom_watch_page_list_info };
            
                await UserFileManager.write(USER_FILE_PATH.NEW_RELEASED_PRODUCT_CUSTOM_WATCH_PAGE_LIST_INFO, custom_watch_page_list_info);
                event.reply('save-new-released-product-custom-watch-page-list-info-reply' + data.id, {err : undefined});
            }catch(err){
                log.error(common.get_log_str('ipc_main_new_product.js', 'save-new-released-product-custom-watch-page-list-info-callback', err));
                event.reply('save-new-released-product-custom-watch-page-list-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('load-new-released-product-blacklist-info', async(event, data) =>{
        (async()=>{
            try{
                const file_data = await UserFileManager.read(USER_FILE_PATH.NEW_RELEASED_PRODUCT_BLACKLIST_INFO);
                event.reply('load-new-released-product-blacklist-info-reply' + data.id, {err : undefined, data : file_data.blacklist_info});
            }catch(err){
                log.error(common.get_log_str('ipc_main_new_product.js', 'load-new-released-product-blacklist-info-callback', err));
                event.reply('load-new-released-product-blacklist-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('load-new-released-custom-watch-page-list-info', async(event, data) =>{
        (async()=>{
            try{
                const file_data = await UserFileManager.read(USER_FILE_PATH.NEW_RELEASED_PRODUCT_CUSTOM_WATCH_PAGE_LIST_INFO);
                event.reply('load-new-released-custom-watch-page-list-info-reply' + data.id, {err : undefined, data : file_data.custom_watch_page_list_info});
            }catch(err){
                log.error(common.get_log_str('ipc_main_new_product.js', 'load-new-released-custom-watch-page-list-info-callback', err));
                event.reply('load-new-released-custom-watch-page-list-info-reply' + data.id, {err : err.message});
            }
        })();
    });
}


module.exports.register = register;