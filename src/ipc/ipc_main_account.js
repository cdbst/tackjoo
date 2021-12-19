const {ipcMain} = require("electron");
const BrowserContext = require("../api/browser_context.js").BrowserContext;
const BrowserContextManager = require("../api/browser_context_mngr.js").BrowserContextManager;
const USER_FILE_PATH = require('../user_file_path.js').USER_FILE_PATH;
const UserFileManager = require("../api/user_file_mngr.js").UserFileManager;
const IPRequestLock = require('../api/ip_request_lock').IPRequestLock;

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('get-logged-in-account-info-list', (event, data) => {

        try{
            let logged_in_browser_contexts = BrowserContextManager.get_all_logged_in_browser_contexts();
            let logged_in_account_info_list = logged_in_browser_contexts.map((browser_context) => browser_context.get_account_info());
            event.reply('get-logged-in-account-info-list-reply' + data.id, {err : undefined, data : logged_in_account_info_list}); 
        }catch(err){
            log.error(common.get_log_str('ipc_main_account.js', 'get-logged-in-account-info-list-callback', err));
            event.reply('get-logged-in-account-info-list-reply' + data.id, {err : 'invalid exception has been occurred', data : undefined});
        }
    });

    ipcMain.on('add-account', (event, data) => {

        const account_info = data.payload;
        const borwser_context = new BrowserContext(account_info.email, account_info.pwd, account_info.id);
        const save_to_file = data.payload.save_to_file;

        try{
            BrowserContextManager.add(borwser_context);
            
            if(save_to_file){
                const file_data = BrowserContextManager.get_file_data();
                UserFileManager.write(USER_FILE_PATH.USER_INFO, file_data, (err) =>{
                    event.reply('add-account-reply' + data.id, err);
                });
            }else{
                event.reply('add-account-reply' + data.id, undefined);
            }
            
        }catch(err){
            log.error(common.get_log_str('ipc_main_account.js', 'add-account-callback', err));
            event.reply('add-account-reply' + data.id, 'invalid exception has been occurred while registering account information');
        }
        
    });

    ipcMain.on('remove-account', (event, data) => {

        let _id = data.payload.id;
        let result = BrowserContextManager.remove(_id);

        if(result == false){
            event.reply('remove-account-reply' + data.id, 'caanot found browser context.');
            return;
        }

        try{
            const file_data = BrowserContextManager.get_file_data();
            UserFileManager.write(USER_FILE_PATH.USER_INFO, file_data, (err) =>{
                event.reply('remove-account-reply' + data.id, err);
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_account.js', 'remove-account-callback', err));
            event.reply('remove-account-reply' + data.id, 'invalid exception has been occurred while removing account information');
        }
    });

    ipcMain.on('get-account-info', (event, data) => {

        try{
            UserFileManager.read(USER_FILE_PATH.USER_INFO, (_err, _data) =>{
                event.reply('get-account-info-reply' + data.id, {err : _err, data : _data});
            });
        }catch(err){
            log.error(common.get_log_str('ipc_main_account.js', 'get-account-info-callback', err));
            event.reply('get-account-info-reply' + data.id, {err : 'invalid exception has been occurred while getting account information', data : undefined});
        }

    });

    ipcMain.on('get-account-id-by-email', (event, data) => {

        try{
            const email = data.payload.email;
            const browser_context = BrowserContextManager.get_by_email(email);
            if(browser_context == undefined){
                event.reply('get-account-id-by-email-reply' + data.id, {err : '계정 정보를 찾을 수 없습니다.', data : undefined});
            }else{
                event.reply('get-account-id-by-email-reply' + data.id, {err : undefined, data : browser_context.id});
            }
            
        }catch(err){
            log.error(common.get_log_str('ipc_main_account.js', 'get-account-id-by-email-callback', err));
            event.reply('get-account-id-by-email-reply' + data.id, {err : '계정 정보를 찾는 도중에 알 수 없는 오류가 발생했습니다.', data : undefined});
        }

    });

    ipcMain.on('login', (event, data) => {
        
        let _id = data.payload.id;
        let borwser_context = BrowserContextManager.get(_id);

        if(borwser_context == undefined){
            log.error(common.get_log_str('ipc_main_account.js', 'login-callback', 'cannot found browser context'));
            event.reply('login-reply' + data.id, 'cannot found browser context');
            return;
        }

        if(borwser_context.is_login){
            borwser_context.clear_cookies();
            borwser_context.clear_csrfToken();
        }

        (async () =>{
            
            try{
                await IPRequestLock.accquire(undefined, undefined);

                let result = await borwser_context.open_main_page();
                if(result == false){
                    log.error(common.get_log_str('ipc_main_account.js', 'login-callback', 'fail with openning main page'));
                    event.reply('login-reply' + data.id, 'fail with openning main page');
                    return;
                }
    
                result = await borwser_context.login();
                if(result){
                    event.reply('login-reply' + data.id, undefined);
                }else{
                    log.error(common.get_log_str('ipc_main_account.js', 'login-callback', 'login fail'));
                    event.reply('login-reply' + data.id, 'login fail');
                }

            }catch(err){
                log.error(common.get_log_str('ipc_main_account.js', 'login-callback', err));
                event.reply('login-reply' + data.id, err.message);
            }finally{
                IPRequestLock.release(undefined, undefined);
            }

        })();
    });
}

module.exports.register = register;