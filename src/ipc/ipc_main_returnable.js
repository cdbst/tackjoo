const { ipcMain } = require("electron");
const { BrowserContextManager } = require("../api/browser_context_mngr");

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('load-returnable-list', (event, data) => {

        (async ()=>{
            try{
                const browser_context_list = BrowserContextManager.get_all_browser_contexts();

                const returnable_info_list_promise_list = [];

                for(var i = 0; i < browser_context_list.length; i++){
                    const browser_context = browser_context_list[i];
                    const p_returnable_info_list = get_returnable_info_list(browser_context);
                    returnable_info_list_promise_list.push(p_returnable_info_list);
                    await common.async_sleep(1000);
                }

                const results = await Promise.all(returnable_info_list_promise_list);
                const errors = [];
                const returnable_info_list = [];

                results.forEach((result)=>{
                    if(result.error !== undefined) errors.push(result.error);
                    if(result.data !== undefined) returnable_info_list.push.apply(returnable_info_list, result.data);
                })
    
                event.reply('load-returnable-list-reply' + data.id, {err : errors.join('\n'), data : returnable_info_list});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'load-returnable-list-callback', err));
                event.reply('load-returnable-list-reply' + data.id, {err : err.message});
            }
        })();
    });

}

async function get_returnable_info_list(browser_context){

    if(browser_context.is_session_expired()){
        const result = await browser_context.login(5);
        if(result == false) return {error : `로그인 실패 : ${browser_context.email}`, data : undefined};
    }else{
        await browser_context.open_main_page(1); // 바로 returnable page에 접근시, 연속된 접근 상황에서는 유효한 응답을 받을수 없어서 호출함.
    }
    
    const returnable_info_list = await browser_context.open_returnable_page(2);
    if(returnable_info_list == undefined) return {error : `정보 취득 실패 : ${browser_context.email}`, data : undefined};
    else return {error : undefined, data : returnable_info_list}
}

module.exports.register = register;