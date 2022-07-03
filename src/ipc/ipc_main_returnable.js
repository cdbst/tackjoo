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

    ipcMain.on('request-returnable', (event, data) => {

        const reutrnable_info_list = data.payload.returnable_info_list;
        const submit_returnable_info = data.payload.submit_returnable_info;

        const message_cb = (returnable_info_id, result) =>{
            event.reply('request-returnable-reply' + data.id, {
                stop : false,
                data : {
                    reutrnable_info_id : returnable_info_id,
                    result : result,
                }
            });
        };

        (async()=>{
            try{
                const browser_context_job_dict = {};

                reutrnable_info_list.forEach((returnable_info)=>{
                    const browser_context = BrowserContextManager.get_by_email(returnable_info.account_email);
                    if(browser_context.id in browser_context_job_dict === false){
                        browser_context_job_dict[browser_context.id] = {};
                        browser_context_job_dict[browser_context.id].browser_context = browser_context;
                        browser_context_job_dict[browser_context.id].returnable_info_list = [];
                    }
                    browser_context_job_dict[browser_context.id].returnable_info_list.push(returnable_info);
                });

                const req_returnable_promise_list = [];

                for(const job_dict of Object.values(browser_context_job_dict)){
                    const p_req_returnable = submit_returnable_list(job_dict.browser_context, job_dict.returnable_info_list, submit_returnable_info, message_cb);
                    req_returnable_promise_list.push(p_req_returnable);
                    await common.async_sleep(2000);
                }

                await Promise.all(req_returnable_promise_list);

                event.reply('request-returnable-reply' + data.id, {
                    stop : true,
                    data : undefined
                });
                
            }catch(err){
                event.reply('request-returnable-reply' + data.id, {
                    stop : true,
                    data : undefined
                });
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

async function submit_returnable_list(browser_context, returnable_info_list, submit_returnable_info, message_cb){

    if(browser_context.is_session_expired()){
        const result = await browser_context.login(5);
        if(result === false){
            returnable_info_list.forEach((returnable_info)=>{
                message_cb(returnable_info._id, false);
            });
            return false;
        }

    }else{
        await browser_context.open_main_page(1); // 바로 returnable page에 접근시, 연속된 접근 상황에서는 유효한 응답을 받을수 없어서 호출함.
    }

    for(var i = 0; i < returnable_info_list.length; i++){

        const returnable_info = returnable_info_list[i];
        
        const default_return_addr_info = await browser_context.returnable_request(returnable_info, 3);
        if(default_return_addr_info === undefined){
            message_cb(returnable_info._id, false);
            continue;
        }

        if(submit_returnable_info.use_default_return_addr){
            common.update_submit_returnable_obj(submit_returnable_info, 'return_addr_info', default_return_addr_info);
        }
        
        const calculator_result = await browser_context.returnable_calculator(returnable_info, submit_returnable_info, 3);
        if(calculator_result === undefined || calculator_result.result !== true){
            message_cb(returnable_info._id, false);
            continue;
        }

        const submit_result = await browser_context.submit_returnable(returnable_info, submit_returnable_info, 3);
        if(submit_result === undefined || submit_result.result !== true){
            message_cb(returnable_info._id, false);
            continue;
        }

        message_cb(returnable_info._id, true);
    }

}

module.exports.register = register;