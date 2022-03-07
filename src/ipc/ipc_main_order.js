const { ipcMain } = require("electron");
const { BrowserContextManager } = require("../api/browser_context_mngr");

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('load-order-info-list', (event, data) => {

        (async ()=>{
            try{
                const browser_context_list = BrowserContextManager.get_all_browser_contexts();
                const errors = [];
                const order_info_list = [];
    
                for(var i = 0; i < browser_context_list.length; i++){
                    const browser_context = browser_context_list[i];
    
                    const {error, data} = await get_order_info_list(browser_context);
                    if(error != undefined){
                        errors.push(error);
                    }else{
                        order_info_list.push.apply(order_info_list, data);
                    }
                }
    
                event.reply('load-order-info-list-reply' + data.id, {err : errors.join('\n'), data : order_info_list});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'load-order-info-list-callback', err));
                event.reply('load-order-info-list-reply' + data.id, {err : err.message});
            }
        })();
    });
}

async function get_order_info_list(browser_context){

    let result = await browser_context.login(false);
    if(result == false) return {error : `로그인 실패 : ${browser_context.email}`, data : undefined};

    let order_info_list = await browser_context.open_order_list_page();
    if(order_info_list == undefined) return {error : `정보 취득 실패 : ${browser_context.email}`, data : undefined};

    return {error : undefined, data : order_info_list}
}

module.exports.register = register;