const { ipcMain } = require("electron");
const { BrowserContextManager } = require("../api/browser_context_mngr");

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('load-thedraw-item-list', (event, data) => {

        (async ()=>{
            try{
                const browser_context_list = BrowserContextManager.get_all_browser_contexts();
                const thedraw_info_list_promise_list = [];

                for(var i = 0; i < browser_context_list.length; i++){
                    const browser_context = browser_context_list[i];
                    const p_order_info_list = get_thedraw_list_info(browser_context);
                    thedraw_info_list_promise_list.push(p_order_info_list);
                    await common.async_sleep(1000);
                }

                const results = await Promise.all(thedraw_info_list_promise_list);
                const errors = [];
                const thedraw_item_list = [];

                results.forEach((result)=>{
                    if(result.error !== undefined) errors.push(result.error);
                    if(result.data !== undefined) thedraw_item_list.push.apply(thedraw_item_list, result.data);
                })
    
                event.reply('load-thedraw-item-list-reply' + data.id, {err : errors.join('\n'), data : thedraw_item_list});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'load-thedraw-item-list-callback', err));
                event.reply('load-thedraw-item-list-reply' + data.id, {err : err.message});
            }
        })();
    });
}

async function get_thedraw_list_info(browser_context){

    let result = await browser_context.login(5);
    if(result == false) return {error : `로그인 실패 : ${browser_context.email}`, data : undefined};

    let thedraw_item_list = await browser_context.open_draw_list_page(1);
    if(thedraw_item_list == undefined) return {error : `정보 취득 실패 : ${browser_context.email}`, data : undefined};

    return {error : undefined, data : thedraw_item_list}
}

module.exports.register = register;