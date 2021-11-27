const {ipcMain} = require("electron");
const util = require("./ipc_main_util.js");
const BrowserContextManager = require("./api/browser_context_mngr.js").BrowserContextManager;
const {isMainThread} = require('worker_threads');

let g_win = undefined;

function register(_win){
    g_win = _win;

    ipcMain.on('send_sensor_data', (event, data) =>{
        
        let sensor_data = data.payload.sensor_data;
        let browser_context_list = BrowserContextManager.get_all_browser_contexts();

        browser_context_list.forEach((browser_context) =>{
            try{
                browser_context.send_sensor_data(sensor_data);
            }catch(e){
                console.warn(e);
            }
        });
    });
}

function gen_sensor_data(){

    return new Promise((resolve, reject) =>{

        if(isMainThread){
            if(g_win == undefined){
                reject('Error : IpcMainSensor module is not registered.');
            }
        
            let data = util.get_ipc_data();
            g_win.webContents.send('gen-sensor-data', data);
        
            ipcMain.once('gen-sensor-data-reply' + data.id, (event, data) => {
                resolve(data.payload.sensor_data);
            });
        }else{
            (async () => {
                try{
                    let sensor_data = await global.MainThreadApiCaller.call('gen_sensor_data', undefined);
                    resolve(sensor_data);
                }catch(e){
                    reject(e);
                }
            })();
        }
    });
}

module.exports.register = register;
module.exports.gen_sensor_data = gen_sensor_data;
