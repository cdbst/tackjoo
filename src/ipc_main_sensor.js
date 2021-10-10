const {ipcMain} = require("electron");
const util = require("./ipc_main_util.js");

let g_win = undefined;

function register(_win){
    g_win = _win;
}

function gen_sensor_data(__callback){

    if(g_win == undefined){
        console.error('Error : IpcMainSensor module is not registered.');
        return;
    }

    let data = util.get_ipc_data();

    g_win.webContents.send('gen-sensor-data', data);

    ipcMain.once('gen-sensor-data-reply' + data.id, (event, sensor_data) => {
        __callback(sensor_data);
    });
    
}

module.exports.register = register;
module.exports.gen_sensor_data = gen_sensor_data;
