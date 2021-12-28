const { ipcMain, shell, clipboard } = require("electron");
const log = require('electron-log');
const common = require('../common/common');
const path = require('path');

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
}

module.exports.register = register;
