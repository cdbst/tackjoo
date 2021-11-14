const {ipcMain} = require("electron");
const USER_FILE_PATH = require('./user_file_path.js').USER_FILE_PATH;
const search_address = require('./api/address_search').search_address;

function register(){

    ipcMain.on('search-address', (event, data) => {

        let ipc_id = data.id;

        search_address(data.payload.address, (err, search_result)=>{
            event.reply('search-address-reply' + ipc_id, {err : err, data : search_result});
        });
    });
}


module.exports.register = register;