const axios = require('axios');
const common = require('../common/common.js');
const log = require('electron-log');
const { dialog, app } = require('electron');

// const AUTH_SERVER_URL = 'http://18.179.4.170:8080';
const AUTH_SERVER_URL = 'http://localhost';

class AuthEngine{
    constructor(){
        this.session_token = undefined;
        this.session_check_interval = 20000;
    }

    async signin(email, pwd){

        const payload_obj = {
            email : email,
            pwd : pwd
        };
        const payload = new URLSearchParams(payload_obj).toString();

        try{
            const res = await axios.post(AUTH_SERVER_URL + '/api/user_login', payload);
            if(res.data.result == false){
                return [false, res.data.message];
            }else{
                this.session_token = res.data.session_token;
                this.start_session_checker();
                return [true, new Date(res.data.expired_date)];
            }
        }catch(err){
            log.error(common.get_log_str('auth_engine.js', 'AuthEngine.signin', err));
            return [false, '로그인 실패 : 알 수 없는 오류 발생'];
        }
    }

    auth_denied(message){
        dialog.showMessageBoxSync(app.main_browser_window, {
            message : message,
            type : "error",
            title : "앱 인증 오류"
        });
        process.exit(1);
    }

    start_session_checker(){
        setInterval(async ()=>{
            try{
                const res = await axios.post(AUTH_SERVER_URL + '/api/ssck', {session_token : this.session_token});
                if(res.data.result == false){
                    this.auth_denied(res.data.message);
                }
            }catch(err){
                log.error(common.get_log_str('auth_engine.js', 'AuthEngine.start_session_checker', err));
                this.auth_denied('사용자 인증에 실패했습니다.');
            }
            
        }, this.session_check_interval);
    }
}

module.exports.AuthEngine = new AuthEngine();

