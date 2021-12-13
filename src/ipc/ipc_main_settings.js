const {ipcMain} = require("electron");
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('save-settings-info', (event, data) => {

        try{
            let ipc_id = data.id;
            let settings_info = data.payload.settings_info;
            
            UserFileManager.write(USER_FILE_PATH.SETTINGS_INFO, settings_info, (err) =>{
                if(err) log.error(common.get_log_str('ipc_main_settings.js', 'UserFileManager.write-callback', err));
                event.reply('save-settings-info-reply' + ipc_id, {err : err});
            });

        }catch(err){
            log.error(common.get_log_str('ipc_main_settings.js', 'save-settings-info-callback', err));
            event.reply('save-settings-info-reply' + data.id, {err : err.message});
        }
    });

    ipcMain.on('load-settings-info', (event, data) => {

        try{
            let ipc_id = data.id;

            UserFileManager.read(USER_FILE_PATH.SETTINGS_INFO, (err, data) =>{
                if(err) log.error(common.get_log_str('ipc_main_settings.js', 'UserFileManager.read-callback', err));
                event.reply('load-settings-info-reply' + ipc_id, {err : err, data : data});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_settings.js', 'load-settings-info-callback', err));
            event.reply('load-settings-info-reply' + ipc_id, {err : err.message});
        }
        
    });
}

module.exports.register = register;