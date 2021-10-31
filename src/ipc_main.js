const IpcMainAccount = require('./ipc_main_account');
const IpcMainSensor = require('./ipc_main_sensor');
const IpcMainProduct = require('./ipc_main_product');
const IpcMainTask = require('./ipc_main_task');


function register(win){
    // IPC Responses
    IpcMainAccount.register();
    IpcMainProduct.register();
    IpcMainSensor.register(win);
    IpcMainTask.register();
    
}

module.exports.register = register;
