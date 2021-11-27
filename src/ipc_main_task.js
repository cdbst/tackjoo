const {ipcMain} = require("electron");
const BrowserContextManager = require("./api/browser_context_mngr.js").BrowserContextManager;
const TaskRunner = require("./api/task_runner").TaskRunner;
const TaskRunnerManager = require("./api/task_runner_mngr").taskRunnerManager;
const common = require("./common/common");

function register(){
    
    ipcMain.on('play-task', async (event, data) =>{
        
        let task_info = data.payload.task_info;
        let product_info = data.payload.product_info;
        let billing_info = data.payload.billing_info;

        let browser_context = BrowserContextManager.get(task_info.account_id);
        
        if(browser_context == undefined){
            event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.FAIL, done : true});
            return;
        }

        event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.PLAY, done : false});

        // let task_runner = new TaskRunner(browser_context, task_info, product_info, billing_info, (task_status)=>{
        //     event.reply('play-task-reply' + task_info._id, {status : task_status, done : false});
        // }, (task_status) =>{
        //     TaskRunnerManager.remove(task_runner._id);
        //     event.reply('play-task-reply' + task_info._id, {status : task_status, done : true});
        // });

        let message_cb = (status_data) =>{
            event.reply('play-task-reply' + task_info._id, {status : status_data, done : false});
        };

        let task_runner = new TaskRunner(browser_context, task_info, product_info, billing_info, message_cb);

        TaskRunnerManager.add(task_runner);

        try{
            await task_runner.start();
            event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.DONE, done : true});
        }catch (err){
            event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.FAIL, done : true});
        }
        
    });

    ipcMain.on('pause-task', (event, data) =>{
        
        let task_info = data.payload.task_info;
        let task_runner = TaskRunnerManager.get(task_info._id);

        if(task_runner == undefined){
            event.reply('pause-task-reply' + task_info._id, {err : 'cannot found task runner'});
            return;
        }

        task_runner.stop();
        TaskRunnerManager.remove(task_runner.task_info._id);
        //event.reply('pause-task-reply' + task_info._id, {err : undefined});
    });
}

module.exports.register = register;
