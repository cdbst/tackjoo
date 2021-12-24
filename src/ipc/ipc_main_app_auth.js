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
                const error = await AuthEngine.signin(data.payload.email, data.payload.password);
                if(error){
                    event.reply('login-app-reply' + data.id, {err : error});
                }else{
                    if(data.payload.remember){
                        UserFileManager.write(USER_FILE_PATH.APP_AUTH_INFO, data.payload, (err) =>{
                            if(err) log.error(common.get_log_str('ipc_main_billing.js', 'UserFileManager.write-callback', err));
                        });
                    }
                    event.reply('login-app-reply' + data.id, {err : undefined, data : true});
                }
            }catch(err){
                log.error(common.get_log_str('ipc_main_billing.js', 'login-app-callback', err));
                event.reply('login-app-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('load-login-info', (event, data) => {
        try{
            UserFileManager.read(USER_FILE_PATH.APP_AUTH_INFO, (err, login_info_data) =>{
                if(err) log.error(common.get_log_str('ipc_main_billing.js', 'UserFileManager.read-callback', err));
                event.reply('load-login-info-reply' + data.id, {err : err, data : login_info_data});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_billing.js', 'load-login-info-callback', err));
            event.reply('load-login-info-reply' + data.id, {err : err.message});
        }
    });

    //TODO : login info remove file interface.
}


module.exports.register = register;