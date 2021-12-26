const {ipcMain} = require("electron");
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;
const IPRequestLock = require('../api/ip_request_lock').IPRequestLock;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('save-settings-info', (event, data) => {
        (async()=>{
            try{
                const settings_info = data.payload.settings_info;
                settings_synchronizer(settings_info);
                
                await UserFileManager.write(USER_FILE_PATH.SETTINGS_INFO, settings_info);
                event.reply('save-settings-info-reply' + data.id, {err : undefined});
            }catch(err){
                log.error(common.get_log_str('ipc_main_settings.js', 'save-settings-info-callback', err));
                event.reply('save-settings-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('load-settings-info', (event, data) => {
        (async()=>{
            try{
                const settings_info_data = await UserFileManager.read(USER_FILE_PATH.SETTINGS_INFO);
                settings_synchronizer(settings_info_data);
                event.reply('load-settings-info-reply' + data.id, {err : undefined, data : settings_info_data});
            }catch(err){
                log.error(common.get_log_str('ipc_main_settings.js', 'load-settings-info-callback', err));
                event.reply('load-settings-info-reply' + data.id, {err : err.message});
            }
        })();
    });
}

function settings_synchronizer(settings_info){
    if(settings_info == undefined) return;
    
    // 중요) 이 곳에서 설정되는 default 값은 AppSettings.jsx의 생성자에서 설정되는 기본 설정 값과 일치해야한다.
    const http_max_req_within_same_ip = settings_info['http_max_req_within_same_ip'] ?? 3;
    IPRequestLock.set_max_num_http_req(http_max_req_within_same_ip);
}

module.exports.register = register;