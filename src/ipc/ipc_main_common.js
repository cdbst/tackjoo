const { ipcMain, shell, clipboard } = require("electron");
const log = require('electron-log');
const common = require('../common/common');

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
}

module.exports.register = register;
