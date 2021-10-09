const cookieMngr = require("./cookie_mngr.js");
const axios = require('axios');

class BrowserContext {

    constructor(_email, _pwd){

        email = _email;
        pwd = _pwd;

        cookie_storage = new cookieMngr.CookieManager();
        cookie_storage.add_cookie_data('social_type=comlogin');
        g_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36';
    }

    login(){

    }

    logout(){

    }

    goMainPage(){

    }
}