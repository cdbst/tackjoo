const IpcMainAccount = require('./ipc_main_account');
const IpcMainSensor = require('./ipc_main_sensor');
const IpcMainProduct = require('./ipc_main_product');


function register(win){
    // IPC Responses
    IpcMainAccount.register();
    IpcMainProduct.register();
    IpcMainSensor.register(win);
    
}

module.exports.register = register;
