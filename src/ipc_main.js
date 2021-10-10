const IpcMainAccount = require('./ipc_main_account.js');
const IpcMainSensor = require('./ipc_main_sensor');


function register(win){
    // IPC Responses
    IpcMainAccount.register();
    IpcMainSensor.register(win);
}

module.exports.register = register;
