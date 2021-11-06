const cookieMngr = require("./cookie_mngr.js");
const axios = require('axios');
const cheerio = require('cheerio');
const qureystring = require('querystring');
const product_page_parser = require('./product_page_parser.js');
const common = require('../common/common.js');

class BrowserContext {

    static NIKE_DOMAIN_NAME = 'www.nike.com';
    static NIKE_URL = 'https://www.nike.com';
    static USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36';
    static SEC_CA_UA = "\"Chromium\";v=\"90\", \" Not A;Brand\";v=\"99\", \"Whale\";v=\"2\""

    constructor(_email, _pwd, _id){

        this.__before_request = this.__before_request.bind(this);
        this.__get_csrfToken = this.__get_csrfToken.bind(this);
        this.__get_USERID_from_main_page = this.__get_USERID_from_main_page.bind(this);
        this.__get_sensor_data_server_url_from_main_page = this.__get_sensor_data_server_url_from_main_page.bind(this);
        this.__open_login_modal = this.__open_login_modal.bind(this);
        this.__get_open_page_header = this.__get_open_page_header.bind(this);
        this.__post_process_open_page = this.__post_process_open_page.bind(this);


        this.is_anonymous = this.is_anonymous.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.open_main_page = this.open_main_page.bind(this);
        this.open_feed_page = this.open_feed_page.bind(this);
        this.open_product_page = this.open_product_page.bind(this);
        this.get_product_sku_inventory = this.get_product_sku_inventory.bind(this);
        this.get_account_info = this.get_account_info.bind(this);
        this.apply_draw = this.apply_draw.bind(this);
        this.open_page = this.open_page.bind(this);

        this.clear_cookies = this.clear_cookies.bind(this);
        this.clear_csrfToken = this.clear_csrfToken.bind(this);

        this.email = _email;
        this.pwd = _pwd;
        this.id = _id;

        this.is_login = false;

        this.__cookie_storage = new cookieMngr.CookieManager();
        this.__cookie_storage.add_cookie_data('social_type=comlogin');

        this.csrfToken = undefined;
        this.sensor_data_server_url = undefined;
    }

    get_account_info(){
        return {
            email : this.email,
            pwd : this.pwd,
            _id : this.id
        }
    }

    is_anonymous(){
        if(this.email == undefined || this.pwd == undefined || this.id == undefined) return true;
        else return false;
    }

    send_sensor_data(sensor_data, __callback){

        if(this.sensor_data_server_url == undefined){
            __callback("This browser context has no sensor data server url " + this.email);
            return;
        }

        let cookies = this.__cookie_storage.get_cookie_data();

        let config = {
            headers: {
                "authority": BrowserContext.NIKE_DOMAIN_NAME,
                "accept": "*/*",
                "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "no-cache",
                "content-type": "text/plain;charset=UTF-8",
                "pragma": "no-cache",
                "sec-ch-ua": BrowserContext.SEC_CA_UA,
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": cookies,
                "origin": BrowserContext.NIKE_URL,
                "referer": BrowserContext.NIKE_URL + "/kr/ko_kr",
                'user-agent': BrowserContext.USER_AGENT,
                'content-length': sensor_data.length
            }
        }

        axios.post(this.sensor_data_server_url, sensor_data, config)
        .then(res => {

            if(res.status == 201 || res.status == 200){

                res.headers['set-cookie'].forEach(cookie_data =>{
                    this.__cookie_storage.add_cookie_data(cookie_data);
                });

                __callback(undefined);

            }else{
                __callback('send_sensor_data - response invalid status code :' + res.status);
            }

        })
        .catch(error => {
            __callback(error);
        });
    }

    login(__callback){

        if(this.is_anonymous()){
            __callback('This browser context is anonymous');
            return;
        }

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

                this.open_main_page();
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

    __get_open_page_header(){
        return {
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

    __post_process_open_page(res_headers, $){

        res_headers['set-cookie'].forEach(cookie_data =>{
            this.__cookie_storage.add_cookie_data(cookie_data);
        });

        this.csrfToken = this.__get_csrfToken($);
        if(this.csrfToken == undefined){
            return false;
        }

        let customer_id = this.__get_USERID_from_main_page($);
        if(customer_id == undefined){
            return false;
        }

        this.__cookie_storage.add_cookie_data('USERID=' + customer_id);

        this.sensor_data_server_url = this.__get_sensor_data_server_url_from_main_page($)
        if(this.sensor_data_server_url == undefined){
            return false;
        }

        return true;
    }

    clear_cookies(){
        this.__cookie_storage.init();
    }
    
    clear_csrfToken(){
        this.csrfToken = undefined;
    }

    open_main_page(__callback = undefined){

        let config = {
            headers: this.__get_open_page_header()
        }

        if(this.__cookie_storage.num_of_cookies > 0){
            config.headers['cookie'] = this.__cookie_storage.get_cookie_data();
        }

        axios.get(BrowserContext.NIKE_URL + '/kr/ko_kr', config)
        .then(res => {

            if(res.status != 200){
                if(__callback) __callback('open_main_page : response ' + res.status);
                return;
            }

            const $ = cheerio.load(res.data);

            let result = this.__post_process_open_page(res.headers, $);
            if(!result){
                if(__callback) __callback('open_main_page : cannot store informations');
                return;
            }

            if(__callback) __callback();
        })
        .catch(err => {
            if(__callback) __callback(err);
        });
    }

    open_feed_page(__callback){

        let config = {
            headers: this.__get_open_page_header()
        }

        axios.get(BrowserContext.NIKE_URL + '/kr/launch/', config)
        .then(res => {

            if(res.status != 200){
                __callback('open_feed_page : response ' + res.status);
                return;
            }

            const $ = cheerio.load(res.data);

            let result = this.__post_process_open_page(res.headers, $);
            if(!result){
                __callback('open_feed_page : cannot store informations');
                return;
            }

            let product_list = product_page_parser.get_product_list_info_from_feed_page($);

            __callback(undefined, product_list);
        })
        .catch(err => {
            __callback(err);
        });
    }

    open_product_page(product_url, __callback){

        let config = {
            headers: this.__get_open_page_header()
        }

        axios.get(product_url, config)
        .then(res => {

            if(res.status != 200){
                __callback('open_product_page : response ' + res.status);
                return;
            }

            const $ = cheerio.load(res.data);

            let result = this.__post_process_open_page(res.headers, $);
            if(!result){
                __callback('open_product_page : cannot store informations');
                return;
            }

            let product_info = product_page_parser.get_product_info_from_product_page($)
            if(product_info == undefined){
                __callback('Cannot collect product information.');
                return;
            }
            
            __callback(undefined, product_info);
        })
        .catch(err => {
            __callback(err);
        });
    }

    get_product_sku_inventory(product_url, product_id, __callback){

        let cookies = this.__cookie_storage.get_cookie_data();

        let _headers = {
            'authority': BrowserContext.NIKE_DOMAIN_NAME,
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'cookie' : cookies,
            'pragma': 'no-cache',
            'referer': product_url,
            'sec-ch-ua': '"Chromium";v="90", " Not A;Brand";v="99", "Whale";v="2"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        }

        let config = {
            headers: _headers,
            params: {
                productId : product_id,
                _ : new Date().getTime()
            }
        }

        let product_sku_inventory_url =  BrowserContext.NIKE_URL + '/kr/launch/productSkuInventory';

        axios.get(product_sku_inventory_url, config)
        .then(res => {

            if(res.status != 200){
                __callback('get_product_sku_inventory : response ' + res.status);
                return;
            }

            res.headers['set-cookie'].forEach(cookie_data =>{
                this.__cookie_storage.add_cookie_data(cookie_data);
            });

            if((res.data instanceof Object) == false){
                __callback('get_product_sku_inventory : unexpected data : data is not object type');
                return;
            }

            if(('usable' in res.data) == false){
                __callback('get_product_sku_inventory : unexpected data : \'unable\' information is not exist.');
                return;
            }
            
            if(('skuPricing' in res.data) == false){
                __callback('get_product_sku_inventory : unexpected data : \'skuPricing\' information is not exist.');
                return;
            }

            __callback(undefined, res.data);
        })
        .catch(err => {
            __callback(err);
        });
    }

    open_page(url, retry, __callback){

        let config = {
            headers: this.__get_open_page_header()
        }

        if(this.__cookie_storage.num_of_cookies > 0){
            config.headers['cookie'] = this.__cookie_storage.get_cookie_data();
        }

        axios.get(url, config)
        .then(res => {

            if(res.status != 200){
                __callback('open_page : response ' + res.status, retry);
                return;
            }

            const $ = cheerio.load(res.data);
            const csrfToken = this.__get_csrfToken($);

            if(csrfToken == undefined){
                __callback('open_page : cannot found csrfToken', retry);
                return;
            }

            __callback(undefined, retry, csrfToken, $);
        })
        .catch(err => {
            __callback(err, retry);
        });
    }

    apply_draw(product_info, size_info, csrfToken, retry, __callback){

        let payload_obj = {
            prodId : product_info.product_id,
            theDrawId : product_info.draw_id,
            skuId : size_info.sku_id,
            redirectUrl : product_info.url,
            thedrawproductxref : size_info.draw_product_xref,
            thedrawskuxref : size_info.draw_sku_xref,
            infoAgree: true,
            smsAgree: true,
            csrfToken: csrfToken
        };

        let payload = qureystring.stringify(payload_obj);

        let cookies = this.__cookie_storage.get_cookie_data();

        let config = {
            headers : {
                "authority": BrowserContext.NIKE_DOMAIN_NAME,
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "ko,en;q=0.9,en-US;q=0.8",
                "content-length": payload.length, // must be fixed
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie": cookies,
                "origin": BrowserContext.NIKE_URL,
                "referer": product_info.url,
                "sec-ch-ua": BrowserContext.SEC_CA_UA,
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "Windows",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent": BrowserContext.USER_AGENT,
                "x-requested-with": "XMLHttpRequest"
            }
        };


        axios.post(BrowserContext.NIKE_URL + '/kr/launch/theDraw/entry', payload, config)
        .then(res => {

            //TODO 이미 드로우 신청한 상황에 대한 예외 처리 필요.
            if(res.status != 200){
                __callback('apply_draw : invalid response status code.' + res.status, retry);
                return;
            }

            if(('result' in res.data) == false){
                __callback('apply_draw : recv invalid payload.', retry);
            }

            if(res.data['result'] == false){
                __callback('apply_draw : draw failed.', retry);
            }

            __callback(undefined, retry, res.data);

        })
        .catch(error => {
            __callback(error, retry);
        });
    }
}

module.exports.BrowserContext = BrowserContext;