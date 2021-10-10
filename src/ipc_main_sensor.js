const {ipcMain} = require("electron");

let g_win = undefined;

function register(_win){
    g_win = _win;
}

function gen_sensor_data(__callback){

    if(g_win == undefined){
        console.error('Error : IpcMainSensor module is not registered.');
        return;
    }

    g_win.webContents.send('gen-sensor-data', 'test');

    ipcMain.once('gen-sensor-data-reply', (event, err) => {
        console.log('test req sensor data : data recv');
    });
    
}

module.exports.register = register;
module.exports.gen_sensor_data = gen_sensor_data;
