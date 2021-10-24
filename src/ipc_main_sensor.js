const {ipcMain} = require("electron");
const util = require("./ipc_main_util.js");
const UserBrowserCxtMngr = require("./api/browser_context_mngr.js").userUserBrowserCxtMngr;

let g_win = undefined;

function register(_win){
    g_win = _win;

    ipcMain.on('send_sensor_data', (event, data) =>{
        
        let sensor_data = data.payload.sensor_data;

        let browser_context_list = UserBrowserCxtMngr.get_all_browser_contexts();

        browser_context_list.forEach((browser_context) =>{
            browser_context.send_sensor_data(sensor_data, (err)=>{
                if(err){
                    console.warn(err);
                }
            });
        });
    });
}

function gen_sensor_data(__callback){

    if(g_win == undefined){
        __callback('Error : IpcMainSensor module is not registered.', undefined);
        return;
    }

    let data = util.get_ipc_data();

    g_win.webContents.send('gen-sensor-data', data);

    ipcMain.once('gen-sensor-data-reply' + data.id, (event, data) => {
        __callback(undefined, data.payload.sensor_data);
    });
    
}

module.exports.register = register;
module.exports.gen_sensor_data = gen_sensor_data;
