const {ipcMain} = require("electron");
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('save-proxy-info', (event, data) => {
        (async()=>{
            try{
                const proxy_info_data = {
                    proxy_info :data.payload.proxy_info
                }
                
                await UserFileManager.write(USER_FILE_PATH.PROXY_INFO, proxy_info_data);
                event.reply('save-proxy-info-reply' + data.id, {err : undefined});
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'save-proxy-info-callback', err));
                event.reply('save-proxy-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('load-proxy-info', (event, data) => {
        (async()=>{
            try{
                const proxy_info_data = await UserFileManager.read(USER_FILE_PATH.PROXY_INFO);
                event.reply('load-proxy-info-reply' + data.id, {err : undefined, data : proxy_info_data.proxy_info});
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'load-proxy-info-callback', err));
                event.reply('load-proxy-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    
}

module.exports.register = register;