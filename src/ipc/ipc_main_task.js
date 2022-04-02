const {ipcMain} = require("electron");
const BrowserContextManager = require("../api/browser_context_mngr.js").BrowserContextManager;
const TaskRunner = require("../api/task_runner").TaskRunner;
const TaskRunnerManager = require("../api/task_runner_mngr").taskRunnerManager;
const IPRequestLock = require('../api/ip_request_lock').IPRequestLock;
const common = require("../common/common");
const log = require('electron-log');

function register(){
    
    ipcMain.on('play-task', async (event, data) =>{
        
        let task_info = data.payload.task_info;
        let product_info = data.payload.product_info;
        let billing_info = data.payload.billing_info;
        let settings_info = data.payload.settings_info;

        const proxy_ip = task_info.proxy_info == undefined ? undefined : task_info.proxy_info.ip;
        const proxy_port = task_info.proxy_info == undefined ? undefined : task_info.proxy_info.port;

        let browser_context = BrowserContextManager.get(task_info.account_id);
        
        if(browser_context == undefined){
            log.error(common.get_log_str('ipc_main_task.js', 'play-task-callback', 'cannot found browser context'));
            event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.FAIL, done : true});
            return;
        }

        event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.PLAY, done : false});

        let message_cb = (status_data) =>{
            event.reply('play-task-reply' + task_info._id, {status : status_data, done : false});
        };

        event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.WAITING_FOR_OTHER_TASK, done : false});
        const task_runner = new TaskRunner(browser_context, task_info, product_info, billing_info, settings_info, message_cb);

        (async () => {
            try{
                await IPRequestLock.accquire(proxy_ip, proxy_port);
                await TaskRunnerManager.add(task_runner);
                const result_task_info = await task_runner.start();
                event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.DONE, done : true, size_info : result_task_info.checked_out_size_info });
            }catch (err){
                log.error(common.get_log_str('ipc_main_task.js', 'play-task-callback', err));
                event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.FAIL, done : true});
            }finally{
                TaskRunnerManager.remove(task_runner.task_info._id);
                IPRequestLock.release(proxy_ip, proxy_port);
            }
        })();
    });

    ipcMain.on('pause-task', (event, data) =>{
        
        let task_info = data.payload.task_info;
        let task_runner = TaskRunnerManager.get(task_info._id);
        if(task_runner != undefined){
            task_runner.stop();
        }else{
            TaskRunnerManager.set_stop_pending(task_info._id);
        }

        //랜더러 단에 즉시 stop 이벤트를 발생시키지 않도록 처리 : stop pending 상태로 갔다가 정상 stop 되는 동작으로 유도하기 위해서.
        //event.reply('pause-task-reply' + task_info._id, {err : undefined});
    });
}

module.exports.register = register;
