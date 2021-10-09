
const {ipcMain} = require("electron");
const BrowserCxt = require("./api/browser_context");
const BrowserCxtMngr = require("./api/browser_context_mngr").browserCxtMngr;

function run(){
    // IPC Responses

    ipcMain.on('asynchronous-message', (event, arg) => {
        console.log(arg) // prints "ping"
        event.reply('asynchronous-reply', 'pong')
    });

    ipcMain.on('send-sensor-data', (event, sensor_data) => {
        
        //console.log(sensor_data);

        //sensor data를 각각 로그인된 계정 세션에 전달하여 각각의 계정 세션(BrowserContext)은 이 sensor data를 nike akam sensor response server로 전송한다.

    });

    ipcMain.on('add-account', (event, account_info) => {
        
        let borwser_context = new BrowserCxt.BrowserContext(account_info.email, account_info.pwd, account_info.id);

        borwser_context.open_main_page((err) =>{

            if(err == undefined){
                BrowserCxtMngr.add(borwser_context);
            }

            event.reply('add-account-reply', err);
        });
    });

    ipcMain.on('login', (event, _id) => {
        
        let borwser_context = BrowserCxtMngr.get(_id);

        if(borwser_context == undefined){
            event.reply('login-reply', 'caanot found browser context.');
            return;
        }

        borwser_context.login((err) =>{
            event.reply('login-reply', err);
        });
    });
}

module.exports.run = run;