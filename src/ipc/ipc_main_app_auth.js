const {ipcMain} = require("electron");
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('login-app', (event, data) => {

        try{
            const auth_info = data.payload;
            event.reply('login-app-reply' + data.id, {err : undefined, data : true});
        }catch(err){
            log.error(common.get_log_str('ipc_main_billing.js', 'login-app-callback', err));
            event.reply('login-app-reply' + data.id, {err : err.message});
        }
    });
}


module.exports.register = register;