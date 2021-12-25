const {ipcMain} = require("electron");
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const AuthEngine = require('../api/auth_engine.js').AuthEngine;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('login-app', (event, data) => {

        (async()=>{
            try{
                const [result, result_data] = await AuthEngine.signin(data.payload.email, data.payload.password);
                if(result == false){
                    event.reply('login-app-reply' + data.id, {err : result_data});
                    return;
                }

                if(data.payload.remember){
                    try{
                        await UserFileManager.write(USER_FILE_PATH.APP_AUTH_INFO, data.payload);
                    }catch(err){
                        log.error(common.get_log_str('ipc_main_billing.js', 'UserFileManager.write', err));
                    }
                }
                event.reply('login-app-reply' + data.id, {err : undefined, data : result_data});
                
            }catch(err){
                log.error(common.get_log_str('ipc_main_billing.js', 'login-app-callback', err));
                event.reply('login-app-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('load-login-info', (event, data) => {

        (async()=>{
            try{
                const login_info_data = await UserFileManager.read(USER_FILE_PATH.APP_AUTH_INFO);
                event.reply('load-login-info-reply' + data.id, {err : undefined, data : login_info_data});
            }catch(err){
                log.error(common.get_log_str('ipc_main_billing.js', 'load-login-info-callback', err));
                event.reply('load-login-info-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('delete-login-info', (event, data) => {
        try{
            const result = UserFileManager.delete(USER_FILE_PATH.APP_AUTH_INFO);
            event.reply('delete-login-info-reply' + data.id, {err : result ? undefined : 'delete fail'});
        }catch(err){
            log.error(common.get_log_str('ipc_main_billing.js', 'delete-login-info-callback', err));
            event.reply('delete-login-info-reply' + data.id, {err : err.message});
        }
    });
}


module.exports.register = register;