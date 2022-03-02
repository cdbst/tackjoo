const { ipcMain, shell, clipboard, app } = require("electron");
const log = require('electron-log');
const common = require('../common/common');
const path = require('path');
const { notify_new_product } = require('../api/notification_mngr');

function register(){

    ipcMain.on('open-external-webpage', (event, data) => {
        try{
            const url = data.payload.url;
            shell.openExternal(url);
        }catch(err){
            log.error(common.get_log_str('ipc_main_common.js', 'open-external-webpage-callback', err));
        }
    });

    ipcMain.on('write-text-to-clipboard', (event, data) => {
        try{
            const text = data.payload.text;
            clipboard.writeText(text);
        }catch(err){
            log.error(common.get_log_str('ipc_main_common.js', 'write-clipboard-to-text-callback', err));
        }
    });

    ipcMain.on('open-log-directory', (event, data) => {
        try{
            const open_path = path.resolve(data.payload.path);
            shell.openPath(open_path);
        }catch(err){
            log.error(common.get_log_str('ipc_main_common.js', 'open-log-directory-callback', err));
        }
    });

    ipcMain.on('get-app-path', (event, data) => {
        try{
            const app_path = require('../user_file_path').APP_DATA_PATH;
            event.reply('get-app-path-reply' + data.id, app_path);
        }catch(err){
            log.error(common.get_log_str('ipc_main_common.js', 'get-app-path-callback', err));
        }
    });

    ipcMain.on('restart-to-update', (event, data) =>{
        (async ()=>{
            try{
                const app_update_info_path = require('../user_file_path').USER_FILE_PATH.APP_UPDATE_INFO;
                const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
                await UserFileManager.write(app_update_info_path, { update : true });

                app.relaunch();
                app.exit();
                
            }catch(err){
                log.error(common.get_log_str('ipc_main_common.js', 'restart-to-update-callback', err));
            }
        })();
    });

    ipcMain.on('notify-new-product', (event, data) =>{
        
        try{
            const product_info = data.payload.product_info;
            notify_new_product(product_info, (e)=>{
                app.main_browser_window.focus();
            });
            
        }catch(err){
            log.error(common.get_log_str('ipc_main_common.js', 'notify-new-product-callback', err));
        }
        
    });
}

module.exports.register = register;
