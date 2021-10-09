const cookieMngr = require("./cookie_mngr.js");
const axios = require('axios');
const cheerio = require('cheerio');

class BrowserContext {

    static NIKE_URL = 'https://www.nike.com';

    constructor(_email, _pwd){

        this.__before_request = this.__before_request.bind(this);
        this.__get_csrfToken = this.__get_csrfToken.bind(this);
        this.__get_USERID_from_main_page = this.__get_USERID_from_main_page.bind(this);
        this.__get_sensor_data_server_url_from_main_page = this.__get_sensor_data_server_url_from_main_page.bind(this);

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.go_main_page = this.go_main_page.bind(this);
        

        this.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36';

        this.email = _email;
        this.pwd = _pwd;

        this.cookie_storage = new cookieMngr.CookieManager();
        this.cookie_storage.add_cookie_data('social_type=comlogin');

        this.csrfToken = undefined;
        this.sensor_data_server_url = undefined;
    }

    login(){

        this.go_main_page((err) =>{

            if(err != undefined){
                console.log(err);
                return;
            }
            
        });

    }

    logout(){

    }

    __before_request(){
        this.csrfToken = undefined;
    }

    __get_csrfToken($){

        let el_list_csrfToken = $('[name=csrfToken]');
        let csrfToken = undefined;

        if(el_list_csrfToken.length > 0) {
            csrfToken = el_list_csrfToken[0].attribs.value;
        }

        return csrfToken;
    }

    __get_sensor_data_server_url_from_main_page($){

        let scripts = $('script').get();
        let server_url = undefined;

        for(var i = 0; i < scripts.length; i++){

            let script = scripts[i];
            if(('src' in script.attribs) == false) continue;

            if((script.attribs.src.includes('https://'))) continue;
            if((script.attribs.src.startsWith('//'))) continue;
            server_url = script.attribs.src;
            break;
        }

        return BrowserContext.NIKE_URL + server_url;
    }

    __get_USERID_from_main_page($){

        let scripts = $('script:not([src])').get();
        let data_script = undefined;

        for(var i = 0 ; i < scripts.length; i++){
            
            let script = scripts[i];
            if('type' in script.attribs) continue;
                
            let script_data = script.children[0].data;

            if(script_data.includes('var _GLOBAL =') == false) continue;
            data_script = script;
            break;
        }

        if(data_script == undefined) return undefined;

        let setting_data = data_script.children[0].data;
        let customer_id = setting_data.split('ID :')[1].split(',')[0].trim();

        return customer_id;
    }

    async go_main_page(__callback){

        this.__before_request();

        let config = {
            headers: {
                'authority': 'www.nike.com',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'cache-control': 'no-cache',
                'pragma': 'no-cache',
                'sec-ch-ua': '"Chromium";v="90", " Not A;Brand";v="99", "Whale";v="2"',
                'sec-ch-ua-mobile': '?0',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': 1,
                'connection': 'keep-alive',
                'user-agent': this.user_agent
            }
        }

        try {
            let response = await axios.get(BrowserContext.NIKE_URL + '/kr/ko_kr', config);

            if(response.status != 200){
                __callback('go_main_page : response ' + res.status);
                return;
            }
    
            response.headers['set-cookie'].forEach(cookie_data =>{
                this.cookie_storage.add_cookie_data(cookie_data);
            });

            const $ = cheerio.load(response.data);
            this.csrfToken = this.__get_csrfToken($);

            if(this.csrfToken == undefined){
                __callback('go_main_page : cannot found csrfToken information from main page');
                return;
            }

            let customer_id = this.__get_USERID_from_main_page($);

            if(customer_id == undefined){
                __callback('go_main_page : cannot found customer_id information from main page');
                return;
            }

            this.cookie_storage.add_cookie_data('USERID=' + customer_id);

            this.sensor_data_server_url = this.__get_sensor_data_server_url_from_main_page($)

            if(this.sensor_data_server_url == undefined){
                __callback('go_main_page : cannot found sensor_data_server_url information from main page');
                return;
            }

            __callback();
            return;

        }catch(err){
            __callback(err);
        }
    }
}

module.exports.BrowserContext = BrowserContext;