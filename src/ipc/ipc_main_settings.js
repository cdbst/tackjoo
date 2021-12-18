const {ipcMain} = require("electron");
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;
const IPRequestLock = require('../api/ip_request_lock').IPRequestLock;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('save-settings-info', (event, data) => {

        try{
            let settings_info = data.payload.settings_info;

            settings_synchronizer(settings_info);
            
            UserFileManager.write(USER_FILE_PATH.SETTINGS_INFO, settings_info, (err) =>{
                if(err) log.error(common.get_log_str('ipc_main_settings.js', 'UserFileManager.write-callback', err));
                event.reply('save-settings-info-reply' + data.id, {err : err});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_settings.js', 'save-settings-info-callback', err));
            event.reply('save-settings-info-reply' + data.id, {err : err.message});
        }
    });

    ipcMain.on('load-settings-info', (event, data) => {

        try{
            UserFileManager.read(USER_FILE_PATH.SETTINGS_INFO, (err, settings_info_data) =>{
                if(err) log.error(common.get_log_str('ipc_main_settings.js', 'UserFileManager.read-callback', err));
                settings_synchronizer(settings_info_data);
                event.reply('load-settings-info-reply' + data.id, {err : err, data : settings_info_data});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_settings.js', 'load-settings-info-callback', err));
            event.reply('load-settings-info-reply' + data.id, {err : err.message});
        }
    });
}

function settings_synchronizer(settings_info){
    
    const http_max_req_within_same_ip = settings_info['http_max_req_within_same_ip'] ?? 3;
    IPRequestLock.set_max_num_http_req(http_max_req_within_same_ip);
}

module.exports.register = register;