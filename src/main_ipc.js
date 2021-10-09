
const {ipcMain} = require("electron");
const BrowserCxt = require("./api/browser_context");

function run(){
    // IPC Responses

    ipcMain.on('asynchronous-message', (event, arg) => {
        console.log(arg) // prints "ping"
        event.reply('asynchronous-reply', 'pong')
    });


    ipcMain.on('send_sensor_data', (event, sensor_data) => {
        
        console.log(sensor_data);

        //sensor data를 각각 로그인된 계정 세션에 전달하여 각각의 계정 세션(BrowserContext)은 이 sensor data를 nike akam sensor response server로 전송한다.
    });
}

module.exports.run = run;