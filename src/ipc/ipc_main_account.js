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

        const account_info = data.payload.account_info;
        const browser_context = new BrowserContext(account_info.email, account_info.pwd, account_info.id, account_info.locked);
        const save_to_file = data.payload.save_to_file;

        (async() =>{
            try{

                BrowserContextManager.add(browser_context);

                if(save_to_file){
                    const file_data = BrowserContextManager.get_file_data();
                    await UserFileManager.write(USER_FILE_PATH.USER_INFO, file_data);
                } 

                event.reply('add-account-reply' + data.id, undefined);

            }catch(err){
                log.error(common.get_log_str('ipc_main_account.js', 'add-account-callback', err));
                event.reply('add-account-reply' + data.id, 'invalid exception has been occurred while registering account information');
            }
        })();
    });

    ipcMain.on('add-account-list', (event, data) => {

        const account_info_list = data.payload;
        event.reply('add-account-list-reply' + data.id, undefined);

        for(var i = 0; i < account_info_list.length; i++){
            const account_info = account_info_list[i];
            const browser_context = new BrowserContext(account_info.email, account_info.pwd, account_info.id, account_info.locked);
            BrowserContextManager.add(browser_context);
        }

        (async() =>{
            try{
                const file_data = BrowserContextManager.get_file_data();
                await UserFileManager.write(USER_FILE_PATH.USER_INFO, file_data);

                event.reply('add-account-list-reply' + data.id, undefined);

            }catch(err){
                log.error(common.get_log_str('ipc_main_account.js', 'add-account-list-callback', err));
                event.reply('add-account-list-reply' + data.id, 'invalid exception has been occurred while registering account information');
            }
        })();
    });

    ipcMain.on('remove-account', (event, data) => {

        let _id = data.payload.id;
        let result = BrowserContextManager.remove(_id);

        if(result == false){
            event.reply('remove-account-reply' + data.id, 'caanot found browser context.');
            return;
        }

        (async() =>{
            try{
                const file_data = BrowserContextManager.get_file_data();
                await UserFileManager.write(USER_FILE_PATH.USER_INFO, file_data);
                event.reply('remove-account-reply' + data.id, undefined);
            }catch(err){
                log.error(common.get_log_str('ipc_main_account.js', 'remove-account-callback', err));
                event.reply('remove-account-reply' + data.id, 'invalid exception has been occurred while removing account information');
            }
        })();
    });

    ipcMain.on('get-account-info', (event, data) => {
        (async()=>{
            try{
                const account_info = await UserFileManager.read(USER_FILE_PATH.USER_INFO);
                event.reply('get-account-info-reply' + data.id, {err : undefined, data : account_info});
            }catch(err){
                log.error(common.get_log_str('ipc_main_account.js', 'get-account-info-callback', err));
                event.reply('get-account-info-reply' + data.id, {err : '계정 정보 파일을 읽을 수 없습니다.', data : undefined});
            }
        })();
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
        let browser_context = BrowserContextManager.get(_id);

        if(browser_context == undefined){
            log.error(common.get_log_str('ipc_main_account.js', 'login-callback', 'cannot found browser context'));
            event.reply('login-reply' + data.id, 'cannot found browser context');
            return;
        }

        if(browser_context.login_date !== undefined){
            browser_context.clear_cookies();
            browser_context.clear_csrfToken();
        }

        (async () =>{
            
            try{
                await IPRequestLock.accquire(undefined, undefined);

                const err = await login(browser_context);
                if(err !== undefined){
                    throw new Error(err);                    
                }

                event.reply('login-reply' + data.id, undefined);

            }catch(err){
                log.error(common.get_log_str('ipc_main_account.js', 'login-callback', err));
                event.reply('login-reply' + data.id, err.message);
            }finally{
                IPRequestLock.release(undefined, undefined);
            }
        })();
    });

    ipcMain.on('cleanup-cart', (event, data) => {
        
        const browser_context = BrowserContextManager.get(data.payload.id);

        if(browser_context === undefined){
            log.error(common.get_log_str('ipc_main_account.js', 'cleanup-cart-callback', 'cannot found browser context'));
            event.reply('cleanup-cart-reply' + data.id, 'cannot found browser context');
            return;
        }

        (async () =>{
            
            try{
                await IPRequestLock.accquire(undefined, undefined);

                if(browser_context.is_session_expired(30)){
                    const err = await login(browser_context);
                    if(err !== undefined){
                        throw new Error(err);                    
                    }
                }

                const result = await browser_context.cleanup_cart(3);
                if(result === false){
                    throw new Error('fail with cleanup cart');
                }

                event.reply('cleanup-cart-reply' + data.id, undefined);

            }catch(err){
                log.error(common.get_log_str('ipc_main_account.js', 'cleanup-cart-callback', err));
                event.reply('cleanup-cart-reply' + data.id, err.message);
            }finally{
                IPRequestLock.release(undefined, undefined);
            }
        })();

    });
}

async function login(browser_context){

    let result = await browser_context.open_main_page(3);
    if(result === false){
        return 'fail with open main page';
    }

    result = await browser_context.login(3);
    if(result === false){
        return 'fail with login';
    }

    return undefined;
}

module.exports.register = register;