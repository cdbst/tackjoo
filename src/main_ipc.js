const {ipcMain} = require("electron");
const BrowserCxt = require("./api/browser_context.js");
const BrowserCxtMngr = require("./api/browser_context_mngr.js").browserCxtMngr;
const UserFileManager = require("./api/user_file_mngr.js").UserFileManager;

function run(){
    // IPC Responses

    ipcMain.on('send-sensor-data', (event, sensor_data) => {
        
        //console.log(sensor_data);

        //sensor data를 각각 로그인된 계정 세션에 전달하여 각각의 계정 세션(BrowserContext)은 이 sensor data를 nike akam sensor response server로 전송한다.

    });

    ipcMain.on('add-account', (event, account_info) => {
        
        let borwser_context = new BrowserCxt.BrowserContext(account_info.email, account_info.pwd, account_info.id);

        //TODO : local filesystem에 사용자 정보를 업데이트 한다.

        borwser_context.open_main_page((err) =>{

            if(err == undefined){
                BrowserCxtMngr.add(borwser_context);
            }

            let file_data = BrowserCxtMngr.get_file_data();

            let ufm = new UserFileManager();
            let path = __dirname + '\\abcd\\test.json';

            ufm.write(path, file_data, (err) =>{
                event.reply('add-account-reply', err);
            });
        });
    });

    ipcMain.on('remove-account', (event, _id) => {

        //TODO : local filesystem에 사용자 정보를 업데이트 한다.

        let result = BrowserCxtMngr.remove(_id);

        if(result == false){
            event.reply('remove-account-reply', 'caanot found browser context.');
        }else{
            event.reply('remove-account-reply', undefined);
        }
    });

    ipcMain.on('login', (event, _id) => {
        
        let borwser_context = BrowserCxtMngr.get(_id);

        if(borwser_context == undefined){
            event.reply('login-reply', 'cannot found browser context.');
            return;
        }

        let do_login = function(){

            borwser_context.login((err) =>{
                event.reply('login-reply', err);
            });
        }

        if(borwser_context.is_login){

            borwser_context.open_main_page((err) =>{ // for page refreesh.

                if(err){
                    event.reply('login-reply', 'caanot open nike.com main page.');
                    return;
                }

                do_login();
            });

        }else{
            do_login();
        }
    });
}

module.exports.run = run;