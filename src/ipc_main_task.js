const {ipcMain} = require("electron");
const util = require("./ipc_main_util.js");
const UserBrowserCxtMngr = require("./api/browser_context_mngr.js").userUserBrowserCxtMngr;

function register(){
    

    ipcMain.on('play-task', (event, data) =>{
        
        let task_info = data.payload.task_info;

        event.reply('play-task-reply' + task_info._id, 'test');

    });

    ipcMain.on('pause-task', (event, data) =>{
        
        let task_info = data.payload.task_info;

        event.reply('pause-task-reply' + task_info._id, 'test');

    });
}

module.exports.register = register;
