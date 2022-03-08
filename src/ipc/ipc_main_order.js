const { ipcMain } = require("electron");
const { BrowserContextManager } = require("../api/browser_context_mngr");

const log = require('electron-log');
const common = require('../common/common');

function register(){

    ipcMain.on('load-order-info-list', (event, data) => {

        (async ()=>{
            try{
                const browser_context_list = BrowserContextManager.get_all_browser_contexts();

                const order_info_list_promise_list = [];

                for(var i = 0; i < browser_context_list.length; i++){
                    const browser_context = browser_context_list[i];
                    const p_order_info_list = get_order_info_list(browser_context);
                    order_info_list_promise_list.push(p_order_info_list);
                    await common.async_sleep(1000);
                }

                const results = await Promise.all(order_info_list_promise_list);
                const errors = [];
                const order_info_list = [];

                results.forEach((result)=>{
                    if(result.error !== undefined) errors.push(result.error);
                    if(result.data !== undefined) order_info_list.push.apply(order_info_list, result.data);
                })
    
                event.reply('load-order-info-list-reply' + data.id, {err : errors.join('\n'), data : order_info_list});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'load-order-info-list-callback', err));
                event.reply('load-order-info-list-reply' + data.id, {err : err.message});
            }
        })();
    });

    ipcMain.on('cancel-order', (event, data) => {

        const order_info = data.payload.order_info;

        (async ()=>{
            try{
                const browser_context = BrowserContextManager.get(order_info.account_id);
        
                if(browser_context === undefined){
                    throw new Error('Cannot found browser context');
                }

                let result = await browser_context.login(false);
                if(result === false) throw new Error('Login fail');

                result = await browser_context.open_cancel_order_page(order_info, 1);
                if(result === false) throw new Error('open cancel page fail');

                result = await browser_context.partial_cancel_calculator(order_info, 1);
                if(result === false) throw new Error('partial cancel fail');

                result = await browser_context.cancel_order(order_info, 1);
                if(result === false) throw new Error('cancel order fail');
    
                event.reply('cancel-order-reply' + data.id, {err : undefined, data : result});
    
            }catch(err){
                log.error(common.get_log_str('ipc_main_proxy.js', 'cancel-order-callback', err));
                event.reply('cancel-order-reply' + data.id, {err : err.message});
            }
        })();
    });
}

async function get_order_info_list(browser_context){

    const result = await browser_context.login(false);
    if(result == false) return {error : `로그인 실패 : ${browser_context.email}`, data : undefined};

    const order_info_list = await browser_context.open_order_list_page();
    if(order_info_list == undefined) return {error : `정보 취득 실패 : ${browser_context.email}`, data : undefined};
    else return {error : undefined, data : order_info_list}
}

module.exports.register = register;