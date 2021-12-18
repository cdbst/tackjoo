const {ipcMain} = require("electron");
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;
const search_address = require('../api/address_search').search_address;
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('search-address', (event, data) => {

        try{
            search_address(data.payload.address, (err, search_result)=>{
                if(err) log.error(common.get_log_str('ipc_main_billing.js', 'search-address-callback', err));
                event.reply('search-address-reply' + data.id, {err : err, data : search_result});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_billing.js', 'search-address-callback', err));
            event.reply('search-address-reply' + data.id, {err : err.message});
        }
    });

    ipcMain.on('save-billing-info', (event, data) => {

        try{
            let billing_info = data.payload.billing_info;
        
            UserFileManager.write(USER_FILE_PATH.BILLING_INFO, billing_info, (err) =>{
                if(err) log.error(common.get_log_str('ipc_main_billing.js', 'UserFileManager.write-callback', err));
                event.reply('save-billing-info-reply' + data.id, {err : err});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_billing.js', 'save-billing-info-callback', err));
            event.reply('save-billing-info-reply' + data.id, {err : err.message});
        }
        
    });

    ipcMain.on('load-billing-info', (event, data) => {

        try{
            UserFileManager.read(USER_FILE_PATH.BILLING_INFO, (err, billing_info_data) =>{
                if(err) log.error(common.get_log_str('ipc_main_billing.js', 'UserFileManager.read-callback', err));
                event.reply('load-billing-info-reply' + data.id, {err : err, data : billing_info_data});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_billing.js', 'load-billing-info-callback', err));
            event.reply('load-billing-info-reply' + data.id, {err : err.message});
        }

    });
}


module.exports.register = register;