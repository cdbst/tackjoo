const { ipcMain, shell } = require("electron");
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
}

module.exports.register = register;
