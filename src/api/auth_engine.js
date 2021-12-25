const axios = require('axios');
const common = require('../common/common.js');
const log = require('electron-log');

// const AUTH_SERVER_URL = 'http://18.179.4.170:8080';
const AUTH_SERVER_URL = 'http://localhost';

class AuthEngine{
    constructor(){
        this.session_token = undefined;
    }

    async signin(email, password){

        const payload_obj = {
            email : email,
            password : password
        };
        const payload = new URLSearchParams(payload_obj).toString();

        try{
            const res = await axios.post(AUTH_SERVER_URL + '/api/user_login', payload);
            if(res.data.result == false){
                return res.data.message;
            }else{
                this.session_token = res.data.session_token;
                return undefined;
            }
        }catch(err){
            log.error(common.get_log_str('auth_engine.js', 'AuthEngine.signin', err));
            return '로그인 실패 : 알 수 없는 오류 발생';
        }
    }

    signout(){

    }

}

module.exports.AuthEngine = new AuthEngine();

