const {ipcMain} = require("electron");
const BrowserCxt = require("./api/browser_context.js");
const UserBrowserCxtMngr = require("./api/browser_context_mngr.js").userUserBrowserCxtMngr;
const UserFileManager = require("./api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('./user_file_path.js').USER_FILE_PATH;

const IpcMainSensor = require('./ipc_main_sensor');

function register(){

    ipcMain.on('get-product-list', (event, data) => {

        let browser_cxt = new BrowserCxt.BrowserContext();

        browser_cxt.open_feed_page((_err)=>{
            event.reply('get-product-list-reply' + data.id, {err : _err});
        });
    });
}


module.exports.register = register;