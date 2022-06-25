const { ipcMain, shell, clipboard, app } = require("electron");
const log = require('electron-log');
const common = require('../common/common');
const util = require("./ipc_util.js");
const path = require('path');
const { notify_new_product, notify_new_product_list } = require('../api/notification_mngr');
const fs = require('fs');

const TERM_FILE_PATH = path.resolve(path.join(app.getAppPath(), 'res', 'term', 'term.txt'));

let g_win = undefined;

function register(win){

    g_win = win;

    ipcMain.on('read-term-file', (event, data) => {

        fs.readFile(TERM_FILE_PATH, 'utf8', (err, term_data) =>{
            if(err){
                log.error(common.get_log_str('ipc_main_common.js', 'read-term-file-callback', err));
                event.reply('read-term-file-reply' + data.id, {err : err, data : undefined});
                return;
            }
            event.reply('read-term-file-reply' + data.id, {err : undefined, data : term_data});
        });
    });

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

                const view_term_info_path = require('../user_file_path').USER_FILE_PATH.VIEW_TERM_INFO;
                await UserFileManager.write(view_term_info_path, { view : false });

                app.relaunch();
                app.exit();
                
            }catch(err){
                log.error(common.get_log_str('ipc_main_common.js', 'restart-to-update-callback', err));
            }
        })();
    });

    ipcMain.on('unset-to-update', (event, data) =>{
        (async ()=>{
            try{
                const app_update_info_path = require('../user_file_path').USER_FILE_PATH.APP_UPDATE_INFO;
                const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
                await UserFileManager.write(app_update_info_path, { update : false });
                
            }catch(err){
                log.error(common.get_log_str('ipc_main_common.js', 'unset-to-update-callback', err));
            }
        })();
    });

    ipcMain.on('update-view-term-setting', (event, data) =>{
        (async ()=>{
            try{

                const setting = data.payload.setting;

                const view_term_info_path = require('../user_file_path').USER_FILE_PATH.VIEW_TERM_INFO;
                const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
                await UserFileManager.write(view_term_info_path, { view : setting });

                event.reply('update-view-term-setting-reply' + data.id, err);
                
            }catch(err){
                log.error(common.get_log_str('ipc_main_common.js', 'update-view-term-setting-callback', err));
                event.reply('update-view-term-setting-reply' + data.id, undefined);
            }
        })();
    });

    ipcMain.on('read-view-term-setting', (event, data) =>{
        (async ()=>{
            try{
                const view_term_info_path = require('../user_file_path').USER_FILE_PATH.VIEW_TERM_INFO;
                const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
                const setting_data = await UserFileManager.read(view_term_info_path);

                event.reply('read-view-term-setting-reply' + data.id, {err : undefined, data : setting_data.view});
                
            }catch(err){
                log.error(common.get_log_str('ipc_main_common.js', 'read-view-term-setting-callback', err));
                event.reply('read-view-term-setting-reply' + data.id, {err : err});
            }
        })();
    });

    ipcMain.on('notify-new-product', (event, data) =>{
        
        try{
            const product_info = data.payload.product_info;
            notify_new_product(product_info, (e)=>{

                app.main_browser_window.focus(); // desktop notification 클릭시 app을 강제로 포커싱시킨다.

                const data = util.get_ipc_data({tab_el_id : 'new-product-tab'}); // app의 tab을 '신상품' 탭으로 변경시킨다.
                g_win.webContents.send('change-app-tab', data);
            });
            
        }catch(err){
            log.error(common.get_log_str('ipc_main_common.js', 'notify-new-product-callback', err));
        }
    });

    ipcMain.on('notify-new-product-list', (event, data) =>{
        
        try{
            let notifier = notify_new_product_list(data.payload.product_info_list);

            notifier.once('click', ()=>{
                app.focusOnWindow();
                const data = util.get_ipc_data({tab_el_id : 'new-product-tab'}); // app의 tab을 '신상품' 탭으로 변경시킨다.
                g_win.webContents.send('change-app-tab', data);
            });
            
        }catch(err){
            log.error(common.get_log_str('ipc_main_common.js', 'notify-new-product-list-callback', err));
        }
    });

    ipcMain.on('exit-program', (event, data) =>{
        app.exit();
    });

    ipcMain.on('minimize-program', (event, data) =>{
        app.main_browser_window.minimize();
    });

    ipcMain.on('maximize-program', (event, data) =>{
        app.main_browser_window.maximize();
    });

    ipcMain.on('restore-maximize-program', (event, data) =>{
        app.main_browser_window.unmaximize();
    });
}

module.exports.register = register;
