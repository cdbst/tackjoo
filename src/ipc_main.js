const IpcMaccount = require('./ipc_main_account.js');


function register(){
    // IPC Responses
    IpcMaccount.register();
}


module.exports.register = register;
