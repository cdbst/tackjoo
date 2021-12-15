const { ipcMain } = require("electron");
const { BrowserContextManager } = require("../api/browser_context_mngr");

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('load-thedraw-item-list', (event, data) => {

        (async ()=>{
            try{
                const browser_context_list = BrowserContextManager.get_all_browser_contexts();
                const errors = [];
    
                for(var i = 0; browser_context_list.length; i++){
                    const browser_context = browser_context_list[i];
    
                    let error = await get_the_draw_list_info(browser_context);
                    if(error != undefined) errors.push(error);
                }
    
                event.reply('load-thedraw-item-list-reply' + data.id, {err : errors.join('\n'), data : undefined});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'load-thedraw-item-list-callback', err));
                event.reply('load-thedraw-item-list-reply' + data.id, {err : err.message});
            }
        })();
    });
}

async function get_the_draw_list_info(browser_context){

    let result = await browser_context.login(false);
    if(result == false) return {error : `로그인 실패 : ${browser_context.email}`, data : undefined};

    let thedraw_item_list = await browser_context.open_draw_list_page();
    if(thedraw_item_list == undefined) return {error : `정보 취득 실패 : ${browser_context.email}`, data : undefined};

    return {error : undefined, data : thedraw_item_list}
}

module.exports.register = register;