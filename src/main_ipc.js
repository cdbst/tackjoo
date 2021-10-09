const {ipcMain} = require("electron");
const BrowserCxt = require("./api/browser_context.js");
const BrowserCxtMngr = require("./api/browser_context_mngr.js").browserCxtMngr;
const UserFileManager = require("./api/user_file_mngr.js").UserFileManager;
const USER_FILE_PATH = require('./user_file_path.js').USER_FILE_PATH;

function run(){
    // IPC Responses

    ipcMain.on('send-sensor-data', (event, sensor_data) => {
        
        //console.log(sensor_data);

        //sensor data를 각각 로그인된 계정 세션에 전달하여 각각의 계정 세션(BrowserContext)은 이 sensor data를 nike akam sensor response server로 전송한다.

    });

    ipcMain.on('add-account', (event, account_info) => {
        
        let borwser_context = new BrowserCxt.BrowserContext(account_info.email, account_info.pwd, account_info.id);

        borwser_context.open_main_page((err) =>{

            if(err == undefined){ // 새로운 유저를 추가하는 것이므로 여기서는 파일을 업데이트 한다.

                BrowserCxtMngr.add(borwser_context);

                write_user_info_file(BrowserCxtMngr, (err) =>{
                    event.reply('add-account-reply', err);
                });

            }else{
                event.reply('add-account-reply', err);
            }
        });
    });

    ipcMain.on('remove-account', (event, _id) => {

        let result = BrowserCxtMngr.remove(_id);

        if(result == false){
            event.reply('remove-account-reply', 'caanot found browser context.');
        }else{
            write_user_info_file(BrowserCxtMngr, (err) =>{
                event.reply('remove-account-reply', err);
            });
        }
    });

    ipcMain.on('get-account-info', (event, _id) => {

        read_user_info_file((_err, _data) =>{
            event.reply('get-account-info-reply', {err : _err, data : _data});
        });
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

function write_user_info_file(_browser_context_mngr, __callback){

    let file_data = _browser_context_mngr.get_file_data();
    let ufm = new UserFileManager();

    ufm.write(USER_FILE_PATH.USER_INFO, file_data, (err) =>{
        __callback(err);
    });
}

function read_user_info_file(__callback){

    let ufm = new UserFileManager();

    ufm.read(USER_FILE_PATH.USER_INFO, (err, data) =>{
        __callback(err, data);
    });
}

module.exports.run = run;