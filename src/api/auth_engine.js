const axios = require('axios');
const common = require('../common/common.js');
const log = require('electron-log');

// const AUTH_SERVER_URL = 'http://18.179.4.170:8080';
const AUTH_SERVER_URL = 'http://localhost';

class AuthEngine{
    constructor(){
        this.session_token = undefined;
        this.expired_date = undefined;
    }

    async signin(email, password){

        const payload_obj = {
            email : email,
            password : password
        };
        const payload = new URLSearchParams(payload_obj).toString();

        try{
            const res = await axios.post(AUTH_SERVER_URL + '/api/user_login', payload);
            return true;
        }catch(err){
            log.error(common.get_log_str('auth_engine.js', 'AuthEngine.signin', error));
            return false;
        }
        
    }

    signout(){

    }

}

module.exports.AuthEngine = new AuthEngine();

