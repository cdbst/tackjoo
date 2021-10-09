const cookieMngr = require("./cookie_mngr.js");
const axios = require('axios');
const cheerio = require('cheerio');
const qureystring = require('querystring');

class BrowserContext {

    static NIKE_DOMAIN_NAME = 'www.nike.com';
    static NIKE_URL = 'https://www.nike.com';
    static USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36';

    constructor(_email, _pwd, _id){

        this.__before_request = this.__before_request.bind(this);
        this.__get_csrfToken = this.__get_csrfToken.bind(this);
        this.__get_USERID_from_main_page = this.__get_USERID_from_main_page.bind(this);
        this.__get_sensor_data_server_url_from_main_page = this.__get_sensor_data_server_url_from_main_page.bind(this);
        this.__open_login_modal =this.__open_login_modal.bind(this);

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.open_main_page = this.open_main_page.bind(this);

        this.email = _email;
        this.pwd = _pwd;
        this.id = _id;

        this.is_login = false;

        this.__cookie_storage = new cookieMngr.CookieManager();
        this.__cookie_storage.add_cookie_data('social_type=comlogin');

        this.csrfToken = undefined;
        this.sensor_data_server_url = undefined;
    }

    login(__callback){

        this.__open_login_modal(err =>{

            if(err) console.warn(err); // 이것은 그냥 경고 처리만 일단 하는 것으로 함.

            let data = {
                'locale': 'ko_KR',
                'dynamicForm': 'login',
                'templatePath': '/authentication/login',
                'userId': '',
                'j_username': this.email,
                'j_password': this.pwd,
                'breeze-me': 'on',
                '_breeze-me': 'off',
                'csrfToken': this.csrfToken
            }
    
            let body = qureystring.stringify(data).replace('_breeze-me', 'breeze-me');
                
            let body_len = body.length;
            let cookies = this.__cookie_storage.get_cookie_data();
    
            let config = {
                headers: {
                    'authority': BrowserContext.NIKE_DOMAIN_NAME,
                    'accept': 'application/json, text/javascript, */*; q=0.01',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                    'cache-control': 'no-cache',
                    'content-length': body_len,
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'cookie': cookies,
                    'origin': BrowserContext.NIKE_URL,
                    'pragma': 'no-cache',
                    'referer': BrowserContext.NIKE_URL + '/kr/ko_kr/',
                    'sec-ch-ua': '"Chromium";v="90", " Not A;Brand";v="99", "Whale";v="2"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': BrowserContext.USER_AGENT,
                    'x-requested-with': 'XMLHttpRequest'
                }
            }
    
            let login_url =  BrowserContext.NIKE_URL + '/kr/ko_kr/login_post.htm';

            axios.post(login_url, body, config)
            .then(res => {

                if(res.status != 200){
                    __callback('login : res status is ' + url.status);
                    return;
                }
    
                if(res.data.ResponseObject.isError == 'true'){
                    __callback('login fail');
                    return;
                }
    
                res.headers['set-cookie'].forEach(cookie_data =>{
                    this.__cookie_storage.add_cookie_data(cookie_data);
                });
                
                this.is_login = true;

                __callback(undefined);
            })
            .catch(err => {
                __callback(err);
            });
        });
    }

    __open_login_modal(__callback){

        let url = BrowserContext.NIKE_URL +'/kr/ko_kr/dynamicformpage?name=login&dataType=model&_=' + new Date().getTime();

        axios.get(url)
        .then(res => {
            
            if(res.status != 200){
                __callback('__open_login_modal : res status is ' + url.status);
                return;
            } 

            res.headers['set-cookie'].forEach(cookie_data =>{
                this.__cookie_storage.add_cookie_data(cookie_data);
            });
            
            __callback(undefined);
        })
        .catch(err => {
            __callback(err);
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

    open_main_page(__callback){

        this.__before_request();
        this.__cookie_storage.init();

        let config = {
            headers: {
                'authority': BrowserContext.NIKE_DOMAIN_NAME,
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
                'user-agent': BrowserContext.USER_AGENT
            }
        }

        axios.get(BrowserContext.NIKE_URL + '/kr/ko_kr', config)
        .then(res => {

            if(res.status != 200){
                __callback('open_main_page : response ' + res.status);
                return;
            }
    
            res.headers['set-cookie'].forEach(cookie_data =>{
                this.__cookie_storage.add_cookie_data(cookie_data);
            });

            const $ = cheerio.load(res.data);
            this.csrfToken = this.__get_csrfToken($);

            if(this.csrfToken == undefined){
                __callback('open_main_page : cannot found csrfToken information from main page');
                return;
            }

            let customer_id = this.__get_USERID_from_main_page($);

            if(customer_id == undefined){
                __callback('open_main_page : cannot found customer_id information from main page');
                return;
            }

            this.__cookie_storage.add_cookie_data('USERID=' + customer_id);

            this.sensor_data_server_url = this.__get_sensor_data_server_url_from_main_page($)

            if(this.sensor_data_server_url == undefined){
                __callback('open_main_page : cannot found sensor_data_server_url information from main page');
                return;
            }

            __callback();
        })
        .catch(err => {
            __callback(err);
        });

    }
}

module.exports.BrowserContext = BrowserContext;