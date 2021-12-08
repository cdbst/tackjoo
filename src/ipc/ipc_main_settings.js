const {ipcMain} = require("electron");
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;

function register(){

    ipcMain.on('save-settings-info', (event, data) => {

        try{
            let ipc_id = data.id;
            let settings_info = data.payload.settings_info;
            
            UserFileManager.write(USER_FILE_PATH.SETTINGS_INFO, settings_info, (err) =>{
                event.reply('save-settings-info-reply' + ipc_id, {err : err});
            });

        }catch(e){
            event.reply('save-settings-info-reply' + data.id, {err : 'invalid exception has been occurred'});
        }
    });

    ipcMain.on('load-settings-info', (event, data) => {

        let ipc_id = data.id;

        UserFileManager.read(USER_FILE_PATH.SETTINGS_INFO, (err, data) =>{
            event.reply('load-settings-info-reply' + ipc_id, {err : err, data : data});
        });
    });
}

module.exports.register = register;