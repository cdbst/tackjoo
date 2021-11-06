const {ipcMain} = require("electron");
const util = require("./ipc_main_util.js");
const UserBrowserCxtMngr = require("./api/browser_context_mngr.js").userUserBrowserCxtMngr;
const TaskRunner = require("./api/task_runner").TaskRunner;
const TaskRunnerManager = require("./api/task_runner_mngr").taskRunnerManager;
const common = require("./common/common");

function register(){
    

    ipcMain.on('play-task', (event, data) =>{
        
        let task_info = data.payload.task_info;
        let product_info = data.payload.product_info;
        
        if((task_info.account_id in UserBrowserCxtMngr) == false){
            event.reply('play-task-reply' + task_info._id, {status : common.TASK_STATUS.FAIL, done : true});
            return;
        }

        let browser_context = UserBrowserCxtMngr[task_info.account_id];
        let task_runner = new TaskRunner(browser_context, task_info, product_info, (task_status)=>{
            event.reply('play-task-reply' + task_info._id, {status : task_status, done : false});
        });

        TaskRunnerManager.add(task_runner);

        task_runner.start((task_status)=>{
            TaskRunnerManager.remove(task_runner._id);
            event.reply('play-task-reply' + task_info._id, {status : task_status, done : true});
        });
    });

    ipcMain.on('pause-task', (event, data) =>{
        
        let task_info = data.payload.task_info;
        let task_runner = TaskRunnerManager.get(task_info._id);

        if(task_runner == undefined){
            event.reply('pause-task-reply' + task_info._id, {err : 'cannot found task runner'});
            return;
        }

        task_runner.stop();
        TaskRunnerManager.remove(task_runner._id);
        event.reply('pause-task-reply' + task_info._id, {err : undefined});
    });
}

module.exports.register = register;
