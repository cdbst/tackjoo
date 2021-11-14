const {ipcMain} = require("electron");
const USER_FILE_PATH = require('./user_file_path.js').USER_FILE_PATH;

function register(){


    ipcMain.on('search-address', (event, data) => {

        let ipc_id = data.id;
        event.reply('search-address-reply' + ipc_id, {err : undefined, data : 'test result - search address'});
    });
}


module.exports.register = register;