const {ipcMain} = require("electron");

let g_win = undefined;

function register(_win){
    g_win = _win;
}


function req_sensor_data(__callback){

    if(g_win == undefined){
        console.error('Error : IpcMainSensor module is not registered.');
        return;
    }

    // ipcMain.once('req-sensor-data-reply', (event, err) => {
    //     console.log('test req sensor data : data recv');
    //     //__callback()
    // });
}

module.exports.register = register;
module.exports.req_sensor_data = req_sensor_data;
