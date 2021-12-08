const {ipcMain} = require("electron");
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('../utils/user_file_path.js').USER_FILE_PATH;

function register(){

    ipcMain.on('save-proxy-info', (event, data) => {

        try{
            let ipc_id = data.id;
            let proxy_info = data.payload.proxy_info;
            
            UserFileManager.write(USER_FILE_PATH.PROXY_INFO, proxy_info, (err) =>{
                event.reply('save-proxy-info-reply' + ipc_id, {err : err});
            });

        }catch(e){
            event.reply('save-proxy-info-reply' + data.id, {err : 'invalid exception has been occurred'});
        }
    });

    ipcMain.on('load-proxy-info', (event, data) => {

        let ipc_id = data.id;

        UserFileManager.read(USER_FILE_PATH.PROXY_INFO, (err, data) =>{
            event.reply('load-proxy-info-reply' + ipc_id, {err : err, data : data});
        });
    });

    
}

module.exports.register = register;