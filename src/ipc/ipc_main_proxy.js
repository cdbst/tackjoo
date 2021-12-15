const {ipcMain} = require("electron");
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('save-proxy-info', (event, data) => {

        try{
            let proxy_info = data.payload.proxy_info;
            
            UserFileManager.write(USER_FILE_PATH.PROXY_INFO, proxy_info, (err) =>{
                if(err) log.error(common.get_log_str('ipc_main_proxy.js', 'UserFileManager.write-callback', err));
                event.reply('save-proxy-info-reply' + data.id, {err : err});
            });

        }catch(err){
            log.error(common.get_log_str('ipc_main_proxy.js', 'save-proxy-info-callback', err));
            event.reply('save-proxy-info-reply' + data.id, {err : err.message});
        }
    });

    ipcMain.on('load-proxy-info', (event, data) => {

        try{
            UserFileManager.read(USER_FILE_PATH.PROXY_INFO, (err, proxy_info_data) =>{
                if(err) log.error(common.get_log_str('ipc_main_proxy.js', 'UserFileManager.read-callback', err));
                event.reply('load-proxy-info-reply' + data.id, {err : err, data : proxy_info_data});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_proxy.js', 'load-proxy-info-callback', err));
            event.reply('load-proxy-info-reply' + data.id, {err : err.message});
        }
    });

    
}

module.exports.register = register;