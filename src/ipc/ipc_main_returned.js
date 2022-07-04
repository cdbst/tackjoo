const { ipcMain } = require("electron");
const { BrowserContextManager } = require("../api/browser_context_mngr");

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('load-returned-info-list', (event, data) => {

        (async ()=>{
            try{
                const browser_context_list = BrowserContextManager.get_all_browser_contexts();

                const returned_info_list_promise_list = [];

                for(var i = 0; i < browser_context_list.length; i++){
                    const browser_context = browser_context_list[i];
                    const p_returned_info_list = get_returned_info_list(browser_context);
                    returned_info_list_promise_list.push(p_returned_info_list);
                    await common.async_sleep(1000);
                }

                const results = await Promise.all(returned_info_list_promise_list);
                const errors = [];
                const returned_info_list = [];

                results.forEach((result)=>{
                    if(result.error !== undefined) errors.push(result.error);
                    if(result.data !== undefined) returned_info_list.push.apply(returned_info_list, result.data);
                })
    
                event.reply('load-returned-info-list-reply' + data.id, {err : errors.join('\n'), data : returned_info_list});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_returned.js', 'load-returned-info-list-callback', err));
                event.reply('load-returned-info-list-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('cancel-return', (event, data) => {

        const returned_info = data.payload.returned_info;

        (async ()=>{
            try{
                const browser_context = BrowserContextManager.get_by_email(returned_info.account_email);
        
                if(browser_context === undefined){
                    throw new Error('Cannot found browser context');
                }

                if(browser_context.is_session_expired()){
                    let result = await browser_context.login(5);
                    if(result === false) throw new Error('Login fail');
                }

                const returned_info_list = await browser_context.open_returned_page(2);
                if(returned_info_list === undefined) throw new Error('open returned page fail');

                const result = await browser_context.cancel_return(returned_info, 1);
                if(result === false) throw new Error('cancel returned fail');
    
                event.reply('cancel-return-reply' + data.id, {err : undefined, data : result});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'cancel-return-callback', err));
                event.reply('cancel-return-reply' + data.id, {err : err.message});
            }
        })();
    });

}

async function get_returned_info_list(browser_context){

    if(browser_context.is_session_expired()){
        const result = await browser_context.login(5);
        if(result == false) return {error : `로그인 실패 : ${browser_context.email}`, data : undefined};
    }else{
        await browser_context.open_main_page(1); // 바로 returnable page에 접근시, 연속된 접근 상황에서는 유효한 응답을 받을수 없어서 호출함.
    }
    
    const returned_info_list = await browser_context.open_returned_page(2);
    if(returned_info_list == undefined) return {error : `정보 취득 실패 : ${browser_context.email}`, data : undefined};
    else return {error : undefined, data : returned_info_list}
}

module.exports.register = register;