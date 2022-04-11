const CookieManager = require("./cookie_mngr.js").CookieManager;
const axios = require('axios-proxy-fix');
const cheerio = require('cheerio');
const product_page_parser = require('./product_page_parser.js');
const checkout_page_parser = require('./checkout_page_parser.js');
const thedraw_list_page_parser = require('./thedraw_list_page_parser');
const { parse_order_list_page } = require('./order_list_page_parser');
const gen_sensor_data = require("../ipc/ipc_main_sensor.js").gen_sensor_data;
const common = require("../common/common.js");
const log = require('electron-log');

class BrowserContext {

    static NIKE_DOMAIN_NAME = 'www.nike.com';
    static NIKE_URL = common.NIKE_URL;
    static USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.70 Whale/3.13.131.27 Safari/537.36';
    static SEC_CA_UA = "\"Chromium\";v=\"90\", \" Not A;Brand\";v=\"99\", \"Whale\";v=\"2\""

    static IAMPORT_URL = 'https://nike-service.iamport.kr';
    static IAMPORT_DOMAIN_NAME = 'nike-service.iamport.kr';

    static REQ_METHOD = {
        GET : 'get',
        POST : 'post'
    };

    constructor(...args){

        this.__init = this.__init.bind(this);
        this.__init_by_json = this.__init_by_json.bind(this);

        this.__reset_csrfToken = this.__reset_csrfToken.bind(this);
        this.__get_csrfToken = this.__get_csrfToken.bind(this);
        this.__get_data_script_from_page = this.__get_data_script_from_page.bind(this);
        this.__get_specific_data_from_page = this.__get_specific_data_from_page.bind(this);
        this.__get_sensor_data_server_url_from_main_page = this.__get_sensor_data_server_url_from_main_page.bind(this);
        this.__open_login_modal = this.__open_login_modal.bind(this);
        this.__get_open_page_header = this.__get_open_page_header.bind(this);
        this.__post_process_open_page = this.__post_process_open_page.bind(this);
        this.__remove_aws_cookies = this.__remove_aws_cookies.bind(this);
        this.__remove_akam_cookies = this.__remove_akam_cookies.bind(this);
        this.__send_fake_sensor_data = this.__send_fake_sensor_data.bind(this);
        this.__post_process_req_fail = this.__post_process_req_fail.bind(this);
        
        this.__http_request = this.__http_request.bind(this);
        this.__get_proxy_cfg = this.__get_proxy_cfg.bind(this);
        this.__judge_cookie_storage = this.__judge_cookie_storage.bind(this);
        this.__set_cookie = this.__set_cookie.bind(this);

        this.is_anonymous = this.is_anonymous.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.open_main_page = this.open_main_page.bind(this);
        this.open_feed_page = this.open_feed_page.bind(this);
        this.open_product_page = this.open_product_page.bind(this);
        this.get_product_sku_inventory = this.get_product_sku_inventory.bind(this);
        this.get_account_info = this.get_account_info.bind(this);
        this.apply_draw = this.apply_draw.bind(this);
        this.open_checkout_page = this.open_checkout_page.bind(this);
        this.open_page = this.open_page.bind(this);
        this.open_draw_list_page = this.open_draw_list_page.bind(this);

        this.open_cancel_order_page = this.open_cancel_order_page.bind(this);
        this.partial_cancel_calculator = this.partial_cancel_calculator.bind(this);
        this.cancel_order = this.cancel_order.bind(this);
        this.cleanup_cart = this.cleanup_cart.bind(this);
        this.is_session_expired = this.is_session_expired.bind(this);
        
        this.clear_cookies = this.clear_cookies.bind(this);
        this.clear_csrfToken = this.clear_csrfToken.bind(this);

        this.update_settings = this.update_settings.bind(this);
        
        if(args.length == 3 || args.length == 0){
            this.__init.apply(null, args); // email, pwd, id
        }else if(args.length == 1){
            this.__init_by_json(args[0]); //json string.
        }else{
            throw new Error("Cannot initalize BrowserContext instance " + args.join(', '));
        }
    }

    __init(_email, _pwd, _id){

        this.email = _email;
        this.pwd = _pwd;
        this.id = _id;

        this.in_progress_login = false;
        this.login_date = undefined;

        this.csrfToken = undefined;
        this.sensor_data_server_url = undefined;

        this.proxy_info = undefined;
        this.settings_info = undefined;

        this.__req_retry_interval = 1500; // app 설정으로 부터 지정되어야 할 값임.
        this.__req_retry_cnt = 30;
        this.__req_timout = 0;
        
        
        this.__cookie_storage = new CookieManager();
        this.__cookie_storage.add_cookie_data('social_type=comlogin');
        this.__cookie_storage.add_cookie_data('NikeCookie=ok');

        this.__iamport_cookie_storage = new CookieManager();
    }

    __init_by_json(json){
        Object.assign(this, json);
        this.__cookie_storage = new CookieManager(json.__cookie_storage);
        this.__iamport_cookie_storage = new CookieManager(json.__iamport_cookie_storage);
        this.login_date = json.login_date !== undefined ? new Date(json.login_date) : undefined;
    }

    update_settings(settings_info){

        this.settings_info = settings_info;
    
        this.__req_retry_interval = this.settings_info.http_req_ret_interval * 1000;
        this.__req_retry_cnt = this.settings_info.http_req_ret_cnt + 1;
        this.__req_timout = this.settings_info.http_req_timeout * 1000;
    }

    is_session_expired(session_timeout){

        if(this.login_date === undefined) return true;
        else return (session_timeout !== 0) && (new Date() > common.add_minutes(this.login_date, session_timeout));
    }

    async __send_fake_sensor_data(){

        try{
            const sensor_data = await gen_sensor_data();
            await this.send_sensor_data(sensor_data);
            return true;

        }catch(err){
            log.info(common.get_log_str('browser_context.js', '__send_fake_sensor_data', err));
            return false;
        }
    }

    async __post_process_req_fail(error, sleep){
        this.__remove_aws_cookies();
        this.__remove_akam_cookies();

        return new Promise((resolve, reject) =>{
            try{
                if(sleep == undefined){
                    resolve();
                }else{
                    setTimeout(()=>{
                        resolve();
                    }, sleep)
                }
            }catch(e){
                log.error(common.get_log_str('browser_context.js', '__post_process_req_fail-Promise-catch', e));
                reject(e);
            }
        });
    }

    __judge_cookie_storage(url){
        if(url.includes(BrowserContext.NIKE_DOMAIN_NAME)){
            return this.__cookie_storage;
        }else if(url.includes(BrowserContext.IAMPORT_DOMAIN_NAME)){
            return this.__iamport_cookie_storage;
        }else{
            return this.__cookie_storage;
        }
    }

    __set_cookie(cookie_storage, res){

        if((res.headers == undefined) || ('set-cookie' in res.headers == false)) return false;

        res.headers['set-cookie'].forEach(cookie_data =>{
            cookie_storage.add_cookie_data(cookie_data);
        });
        
        return true;
    }

    __get_proxy_cfg(){

        // const proxy = {
        //     host: 'xxx.xxx.xxx.xxx',
        //     port: xxx,
        //     // auth: {
        //     //     username: 'xxx',
        //     //     password: 'xx'
        //     // }
        // }

        if(this.proxy_info == undefined) return undefined;

        let proxy_cfg = {
            host: this.proxy_info.ip,
            port: this.proxy_info.port
        }

        let auth_cfg = undefined;

        if(this.proxy_info.id != '' && this.proxy_info.id != undefined){
            auth_cfg = {
                username : this.proxy_info.id
            }
        } 
        
        if(auth_cfg != undefined && this.proxy_info.pwd != undefined){
            auth_cfg.password = this.proxy_info.pwd
        }

        if(auth_cfg != undefined){
            proxy_cfg.auth = auth_cfg
        }

        return proxy_cfg;
    }

    async __http_request(method, url, headers, params, send_sensor_data = true){

        if(send_sensor_data){
            await this.__send_fake_sensor_data();
        }

        if(headers == undefined) headers = {};

        let cookie_storage = this.__judge_cookie_storage(url);
        if(cookie_storage.num_of_cookies > 0){
            headers['cookie'] = cookie_storage.get_serialized_cookie_data();
        }

        let axios_req_cfg = {
            method: method,
            url: url,
            timeout: this.__req_timout,
            headers : headers
        };

        let proxy_cfg = this.__get_proxy_cfg();
        if(proxy_cfg != undefined){
            axios_req_cfg.proxy = proxy_cfg;
        }
        
        if(params != undefined){
            if(method == BrowserContext.REQ_METHOD.POST){
                axios_req_cfg['data'] = params;
            }else{
                axios_req_cfg['params'] = params;
            }
        }

        return new Promise((resolve, reject)=>{
            axios(axios_req_cfg)
            .then(res => {
                resolve(res);
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    __remove_aws_cookies(){
        this.__cookie_storage.remove_cookie_data('AWSALBTG');
        this.__cookie_storage.remove_cookie_data('AWSALBCORS');
        this.__cookie_storage.remove_cookie_data('AWSALB');
        this.__cookie_storage.remove_cookie_data('AWSALBTGCORS');
    }

    __remove_akam_cookies(){
        this.__cookie_storage.remove_cookie_data('_abck');
        this.__cookie_storage.remove_cookie_data('ak_bmsc');
        this.__cookie_storage.remove_cookie_data('bm_mi');
        this.__cookie_storage.remove_cookie_data('bm_sv');
        this.__cookie_storage.remove_cookie_data('bm_sz');
        this.__cookie_storage.remove_cookie_data('geoloc');
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

    async open_page(url, retry){

        let headers = this.__get_open_page_header();

        retry = retry === undefined ? this.__req_retry_cnt : retry;

        for(var i = 0; i < retry; i++){

            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, url, headers);
    
                if(res.status != 200){
                    throw new Error('open_page : response ' + res.status);
                }

                const $ = cheerio.load(res.data);
                this.__post_process_open_page(res.headers, $);
    
                return res;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_page', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async send_sensor_data(sensor_data){

        if(this.sensor_data_server_url == undefined){
            log.verbose(common.get_log_str('browser_context.js', 'send_sensor_data', 'sensor_data_server_url is not set condition'));
            throw new Error("This browser context has no sensor data server url " + this.email);
        }

        let headers = {
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
            "origin": BrowserContext.NIKE_URL,
            "referer": BrowserContext.NIKE_URL + "/kr/ko_kr",
            'user-agent': BrowserContext.USER_AGENT,
            'content-length': sensor_data.length
        }

        try{

            const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, this.sensor_data_server_url, headers, sensor_data, false);

            if(res.status == 201 || res.status == 200){

                let result = this.__set_cookie(this.__cookie_storage, res);
                if(result == false){
                    throw new Error('send_sensor_data - fail with recving akam sensor cookies :' + res.status);    
                }

            }else{
                throw new Error('send_sensor_data - response invalid status code :' + res.status);
            }

        }catch(e){
            log.warn(common.get_log_str('browser_context.js', 'send_sensor_data', e));
            throw e;
        }
    }

    async login(retry_cnt = undefined){
        if(this.in_progress_login){
            log.info(common.get_log_str('browser_context.js', 'login', 'inprogress login in work'));
            return false;
        }

        this.in_progress_login = true;

        if(this.is_anonymous()){
            this.in_progress_login = false;
            log.info(common.get_log_str('browser_context.js', 'login', 'This browser context is anonymous'));
            return false;
        }

        retry_cnt = retry_cnt === undefined ? this.__req_retry_cnt : retry_cnt;

        let result = await this.open_main_page(retry_cnt);
        if(result == false){
            this.in_progress_login = false;
            log.error(common.get_log_str('browser_context.js', 'login', 'Cannot open main page'));
            return false;
        }

        // result = await this.__open_login_modal();
        // if(result == false){
        //     log.warn(common.get_log_str('browser_context.js', 'login', 'Cannot open login modal'));
        // }

        let payload_obj = {
            'locale': 'ko_KR',
            'dynamicForm': 'login',
            'templatePath': '/authentication/login',
            'userId': '',
            'j_username': this.email,
            'j_password': this.pwd,
            'breeze-me': 'on',
            '_breeze-me': 'off',
            'csrfToken': this.csrfToken
        };

        let payload = new URLSearchParams(payload_obj).toString().replace('_breeze-me', 'breeze-me');

        let headers = {
            'authority': BrowserContext.NIKE_DOMAIN_NAME,
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-length': payload.length,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': BrowserContext.NIKE_URL,
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + '/kr/ko_kr/',
            'sec-ch-ua': '"Chromium";v="90", " Not A;Brand";v="99", "Whale";v="2"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        for(var i = 0; i < retry_cnt; i++){
            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/ko_kr/login_post.htm', headers, payload);
                
                if(res.data.ResponseObject.isError == 'true'){
                    throw new Error('login fail - response server data is error status.');
                }
    
                this.__set_cookie(this.__cookie_storage, res);
                
                this.in_progress_login = false;
                this.login_date = new Date();
                return true;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'login', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        this.in_progress_login = false;
        return false;
    }

    async __open_login_modal(){

        let url = BrowserContext.NIKE_URL +'/kr/ko_kr/dynamicformpage?name=login&dataType=model&_=' + new Date().getTime();

        try{
            const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, url, undefined);

            if(res.status != 200){
                throw new Error('__open_login_modal : res status is ' + res.status);
            } 

            this.__set_cookie(this.__cookie_storage, res);

            return true;

        }catch(e){
            log.error(common.get_log_str('browser_context.js', '__open_login_modal', e));
            await this.__post_process_req_fail(e, this.__req_retry_interval);
        }
        
        return false;
    }

    logout(){

    }

    __reset_csrfToken(){
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

    __get_data_script_from_page($){

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

        return data_script;
    }

    __get_specific_data_from_page(data_script, property){

        if(data_script == undefined) return undefined;

        let setting_data = data_script.children[0].data;
        let customer_id = setting_data.split(property)[1].split(',')[0].trim();

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
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': 1,
            'user-agent': BrowserContext.USER_AGENT
        }
    }

    __post_process_open_page(res_headers, $){

        if('set-cookie' in res_headers){
            res_headers['set-cookie'].forEach(cookie_data =>{
                this.__cookie_storage.add_cookie_data(cookie_data);
            });
        }

        this.csrfToken = this.__get_csrfToken($);
        if(this.csrfToken == undefined){
            return false;
        }

        let data_script = this.__get_data_script_from_page($);
        if(data_script == undefined){
            return false;
        }

        let customer_id = this.__get_specific_data_from_page(data_script, 'ID :');
        if(customer_id == undefined){
            return false;
        }

        this.__cookie_storage.add_cookie_data('USERID=' + customer_id);

        let is_sign_in = this.__get_specific_data_from_page(data_script, 'ISSIGNIN :');
        if(is_sign_in == undefined){
            return false;
        }
        is_sign_in = is_sign_in == 'true' ? true : false;
        this.__cookie_storage.add_cookie_data('ISSIGNIN=' + is_sign_in);

        this.sensor_data_server_url = this.__get_sensor_data_server_url_from_main_page($)
        if(this.sensor_data_server_url == undefined){
            return false;
        }

        return true;
    }

    clear_cookies(){
        this.__cookie_storage.reset();
    }
    
    clear_csrfToken(){
        this.csrfToken = undefined;
    }

    async open_main_page(retry_cnt){

        let headers = this.__get_open_page_header();

        retry_cnt = retry_cnt !== undefined ? retry_cnt : this.__req_retry_cnt;

        for(var i = 0; i < retry_cnt; i++){
            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/ko_kr', headers);

                if(res.status != 200){
                    throw new Error('open_main_page : response ' + res.status);
                }
    
                const $ = cheerio.load(res.data);
    
                let result = this.__post_process_open_page(res.headers, $);
                if(result == false){
                    throw new Error('open_main_page : cannot store page informations');
                }
    
                return true;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_main_page', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return false;
    }

    async open_feed_page(){

        let headers = this.__get_open_page_header();

        for(var i = 0; i < this.__req_retry_cnt; i++){
            try{
                let res = await this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/launch/', headers);

                if(res.status != 200){
                    throw new Error('open_feed_page : response ' + res.status);
                }
    
                const $ = cheerio.load(res.data);
    
                const result = this.__post_process_open_page(res.headers, $);
                if(!result){
                    throw new Error('open_feed_page : cannot store informations');
                }
    
                const product_list = product_page_parser.get_product_list_info_from_feed_page($);
                return product_list;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_feed_page', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async open_product_page(product_url, retry_cnt = undefined){

        let product_info = undefined;

        this.__cookie_storage.add_cookie_data('oldCartId=none');
        let headers = this.__get_open_page_header();

        let __retry_cnt = retry_cnt === undefined ? this.__req_retry_cnt : retry_cnt;
        __retry_cnt = Math.abs(__retry_cnt);

        for(var i = 0; i < __retry_cnt; ++i){

            //파라메터로 전달받은 retry_cnt가 음수값인 경우, 무한 반복한다.
            if(retry_cnt < 0) i--;

            try{

                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, product_url, headers, undefined, true);

                if(res.status != 200){
                    throw new Error('open_product_page : response ' + res.status);
                }

                const $ = cheerio.load(res.data);

                let result = this.__post_process_open_page(res.headers, $);
                if(result == false){
                    throw new Error('open_product_page : cannot store informations');
                }

                product_info = product_page_parser.get_product_info_from_product_page($);
                if(product_info == undefined){
                    throw new Error('open_product_page : Cannot collect product information.');
                }

                this.__cookie_storage.add_cookie_data('c20=' + product_info.model_id);

                break;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_product_page', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        if(product_info == undefined) return undefined;
        if(product_info.sell_type != common.SELL_TYPE.normal) return product_info;

        let sku_inventory_info = await this.get_product_sku_inventory(product_url, product_info);
        if(sku_inventory_info == undefined) return undefined;

        product_page_parser.update_product_info_as_sku_inventory_info(product_info, sku_inventory_info);
        return product_info;
    }

    async get_product_sku_inventory(product_url, product_info){

        let headers = {
            'authority': BrowserContext.NIKE_DOMAIN_NAME,
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'referer': product_url,
            'sec-ch-ua': '"Chromium";v="90", " Not A;Brand";v="99", "Whale";v="2"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        let req_url = undefined;
        if(product_info.category === 'snkrs'){
            req_url = BrowserContext.NIKE_URL + '/kr/launch/productSkuInventory';
        }else{
            req_url = BrowserContext.NIKE_URL + '/kr/ko_kr/productSkuInventory';
        }

        for(var i = 0; i < this.__req_retry_cnt; i++){
            try{
                const params = {
                    productId : product_info.product_id, 
                    _ : new Date().getTime()
                };

                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, req_url, headers, params);

                if(res.status != 200){
                    throw new Error('get_product_sku_inventory : response ' + res.status);
                }
    
                this.__set_cookie(this.__cookie_storage, res);
    
                if((res.data instanceof Object) == false){
                    throw new Error('get_product_sku_inventory : unexpected data : data is not object type');
                }
    
                if(('usable' in res.data) == false){
                    throw new Error('get_product_sku_inventory : unexpected data : \'unable\' information is not exist.');
                }
                
                if(('skuPricing' in res.data) == false){
                    throw new Error('get_product_sku_inventory : unexpected data : \'skuPricing\' information is not exist.');
                }

                return res.data;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'get_product_sku_inventory', e));
                const p_open_page = this.open_page(product_url, 1); // get_product_sku_inventory 요청은 실패시 재시도 하려면 임의의 page 요청을 한번 해야한다.
                const p_timeout =  this.__post_process_req_fail(e, this.__req_retry_interval);
                await Promise.all([p_open_page, p_timeout]);
            }
        }

        return undefined;
    }

    async apply_draw(product_info, size_info, __callback){

        let payload_obj = {
            prodId : product_info.product_id,
            theDrawId : product_info.draw_id,
            skuId : size_info.sku_id,
            redirectUrl : product_info.url,
            thedrawproductxref : size_info.draw_product_xref,
            thedrawskuxref : size_info.draw_sku_xref,
            infoAgree: true,
            smsAgree: true,
            csrfToken: this.csrfToken
        };

        let payload = new URLSearchParams(payload_obj).toString();
        
        let headers = {
            "authority": BrowserContext.NIKE_DOMAIN_NAME,
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "ko,en;q=0.9,en-US;q=0.8",
            "content-length": payload.length, // must be fixed
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",    
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
        };

        for(var i = 0; i < this.__req_retry_cnt; i++){

            try{

                const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/launch/theDraw/entry', headers, payload);

                if(res.status != 200){
                    throw new Error('apply_draw : invalid response status code.' + res.status);
                }
    
                this.__set_cookie(this.__cookie_storage, res);
    
                if(('result' in res.data) == false){
                    throw new Error('apply_draw : recv invalid payload.');
                }
    
                if(res.data['dupFlag'] == true){
                    return res.data;
                }else if(res.data['result'] == false){
                    throw new Error('apply_draw : draw failed. invalid result : ' + res.data['result']);
                }

                return res.data;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'apply_draw', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async add_to_cart(product_info, size_info){

        let payload_obj = {
            'SIZE' : size_info['id'],
            'quantity' : 1,
            'csrfToken' : this.csrfToken,
            'productId' : product_info['product_id']
        };

        payload_obj[product_info.item_attr] = size_info['name'];

        let payload = new URLSearchParams(payload_obj).toString()

        let headers = {
            "authority": BrowserContext.NIKE_DOMAIN_NAME,
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control" : "no-cache",
            "content-length": payload.length, // must be fixed
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": BrowserContext.NIKE_URL,
            "pragma" : "no-cache",
            "referer": product_info.url,
            "sec-ch-ua": BrowserContext.SEC_CA_UA,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "Windows",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": BrowserContext.USER_AGENT,
            "x-requested-with": "XMLHttpRequest"
        };

        let req_url = undefined;
        if(product_info.category === 'snkrs'){
            req_url = BrowserContext.NIKE_URL + '/kr/launch/cart/add?directOrder=true';
        }else{
            req_url = BrowserContext.NIKE_URL + '/kr/ko_kr/cart/add?directOrder=true';
        }

        for(var i = 0; i < this.__req_retry_cnt; i++){
            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, req_url, headers, payload);

                if(res.status != 200){
                    throw new Error('add_to_cart : invalid response status code.' + res.status);
                }
    
                this.__set_cookie(this.__cookie_storage, res);

                if(('error' in res.data) && (typeof res.data.error) === 'string' && 
                    (res.data.error.includes('재고가 없습니다') || res.data.error.includes('유효하지 않습니다'))){
                    log.error(common.get_log_str('browser_context.js', 'add_to_cart', res.data.error));
                    return size_info; // 상품 재고가 없는 상황에서 retry 하는 것은 의미가 없다. 이와 같은 경우 구매를 시도한 size_info object를 반환한다.
                }

                if('error' in res.data){
                    log.error(common.get_log_str('browser_context.js', 'add_to_cart', res.data.error));
                }
    
                if(('quantityAdded' in res.data) == false || ('cartItemCount' in res.data) == false){
                    log.error(common.get_log_str('browser_context.js', 'add_to_cart', res.data));
                    throw new Error('add_to_cart : recv invalid payload.');
                }
    
                return res.data;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'add_to_cart', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async open_checkout_page(product_info){

        let headers = this.__get_open_page_header();
        headers['sec-fetch-site'] = 'same-origin';
        headers['refer'] = product_info.url;
        headers['upgrade-insecure-requests'] = 1;

        let req_url = undefined;
        if(product_info.category === 'snkrs'){
            req_url = BrowserContext.NIKE_URL + '/kr/launch/checkout';
        }else{
            req_url = BrowserContext.NIKE_URL + '/kr/ko_kr/checkout';
        }

        for(var i = 0; i < this.__req_retry_cnt; i++){
            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, req_url, headers);

                if(res.status != 200){
                    throw new Error('open_checkout_page : response ' + res.status);
                }
    
                const $ = cheerio.load(res.data);
    
                let result = this.__post_process_open_page(res.headers, $);
                if(result == false){
                    throw new Error('open_checkout_page : cannot store page informations');                    
                }

                const billing_info = checkout_page_parser.get_billing_info_from_checkout_page($);
                return billing_info;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_checkout_page', e));
                this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }
        
        return undefined;
    }

    async checkout_request(billing_info, product_info){

        let headers = {
            'accept':' */*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'cookie': this.__cookie_storage.get_serialized_cookie_data(),
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + (product_info.category === 'snkrs' ? '/kr/launch/checkout' : '/kr/ko_kr/checkout'),
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile':' ?0',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        let req_url = undefined;
        if(product_info.category === 'snkrs'){
            req_url = BrowserContext.NIKE_URL + '/kr/launch/checkout/request';
        }else{
            req_url = BrowserContext.NIKE_URL + '/kr/ko_kr/checkout/request';
        }

        for(var i = 0; i < this.__req_retry_cnt; i++){
            try{

                const params = {
                    pay_method: billing_info.pay_method === 'kakaopay' ? 'point' : billing_info.pay_method,
                    gToken: '',
                    _: new Date().getTime()
                }

                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, req_url, headers, params);

                if(res.status != 200){
                    throw new Error('checkout_request : invalid response status : ' + res.status);
                }

                if(('isError' in res.data === true) && res.data['isError'] === true){

                    if(('_global' in res.data === true) && res.data['_global'].includes('재고가 없습니다')){
                        return undefined; // 재고가 없는 상태에서 계속 재시도 하는 것은 무의미 하므로 바로 종료 시킨다.
                    }
                }

                if('total_amount' in res.data == false){
                    throw new Error('checkout_request : invalid response data ');
                }

                return res.data;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'checkout_request', e));
                this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async checkout_singleship(billing_info, product_info){

        let payload_obj = {
            'address.isoCountryAlpha2': 'US',
            'isSearchAddress': true,
            'address.fullName': billing_info.buyer_name,
            'address.phonePrimary.phoneNumber': billing_info.phone_num,
            'address.addressLine1': billing_info.buyer_addr1,
            'address.addressLine2': billing_info.buyer_addr2,
            'address.postalCode': billing_info.postal_code,
            'selectPersonalMessage': '',
            'personalMessageText': '',
            'fulfillmentOptionId': 1,
            'csrfToken': this.csrfToken
        }

        let payload = new URLSearchParams(payload_obj).toString();
        
        let headers = {
            'authority': BrowserContext.NIKE_DOMAIN_NAME,
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-length': payload.length,
            'content-type': 'application/x-www-form-urlencoded',
            'origin': BrowserContext.NIKE_URL,
            'pragma': 'no-cache',
            'referer' : BrowserContext.NIKE_URL + (product_info.category === 'snkrs' ? '/kr/launch/checkout' : '/kr/ko_kr/checkout'),
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': 1,
            'user-agent': BrowserContext.USER_AGENT,
            
        }

        let req_url = undefined;
        if(product_info.category === 'snkrs'){
            req_url = BrowserContext.NIKE_URL + '/kr/launch/checkout/singleship';
        }else{
            req_url = BrowserContext.NIKE_URL + '/kr/ko_kr/checkout/singleship';
        }

        for(var i = 0; i < this.__req_retry_cnt; i++){

            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, req_url, headers, payload);

                if(res.status != 200){
                    __callback('checkout_singleship : response invalid status : ' + res.status, undefined);
                    return;
                }

                const $ = cheerio.load(res.data);
                let pay_prepare_payload = undefined;

                if(billing_info.pay_method === 'kakaopay'){
                    pay_prepare_payload = checkout_page_parser.parse_kakaopay_prepare_payload_from_checkout_page($);
                }else if(billing_info.pay_method === 'payco'){
                    pay_prepare_payload = checkout_page_parser.parse_payco_prepare_payload_from_checkout_page($);
                }
                
                if(pay_prepare_payload == undefined){
                    throw new Error('checkout_singleship : cannot parse payment payload from checkout page.');
                }
                
                return pay_prepare_payload;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'checkout_singleship', e));
                this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async prepare_pay(prepare_pay_payload, billing_info){

        let payload = new URLSearchParams(prepare_pay_payload).toString();

        let headers = {
            'authority': BrowserContext.IAMPORT_DOMAIN_NAME,
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-length': payload.length,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': BrowserContext.IAMPORT_URL,
            'pragma': 'no-cache',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        let req_url = undefined;

        if(billing_info.pay_method === 'kakaopay'){
            headers.referer = 'https://nike-service.iamport.kr/payments/ready/imp35948874/kakaopay/CA00004A62';
            req_url = BrowserContext.IAMPORT_URL + '/kakaopay_payments/prepare.json';
        }else if(billing_info.pay_method === 'payco'){
            headers.referer = 'https://nike-service.iamport.kr/payments/ready/imp35948874/payco/IM_4AKE96';
            req_url = BrowserContext.IAMPORT_URL + '/payco_payments/prepare.json';
        }

        for(var i = 0; i < this.__req_retry_cnt; i++){
            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, req_url, headers, payload);

                if('data' in res.data == false){
                    throw new Error('prepare_pay : invalid response data : `data` is not in response payload');
                }

                if(res.data.code != 0){
                    throw new Error('prepare_pay : prepare pay fail - result code is ' + res.data.code + '  msg :' + res.data.msg);
                }

                this.__set_cookie(this.__iamport_cookie_storage, res);

                if(billing_info.pay_method === 'kakaopay'){
                    return res.data.data.kakaoData.next_redirect_pc_url;
                }else if(billing_info.pay_method === 'payco'){
                    return res.data.data.payco_reserve.orderSheetUrl;
                }else{
                    return undefined;
                }

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'prepare_pay', e));
                this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async open_draw_list_page(__retry_cnt = undefined){

        let headers = this.__get_open_page_header();
        headers['sec-fetch-site'] = 'same-origin';
        headers['upgrade-insecure-requests'] = 1;

        __retry_cnt = __retry_cnt === undefined ? this.__req_retry_cnt : __retry_cnt;

        for(var i = 0; i < __retry_cnt; i++){
            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/ko_kr/account/theDrawList', headers);

                if(res.status != 200){
                    throw new Error('open_draw_list_page : response ' + res.status);
                }
    
                const $ = cheerio.load(res.data);
                const the_draw_item_list = thedraw_list_page_parser.parse_thedraw_item_list($, this);
                return the_draw_item_list.length == 0 ? undefined :  the_draw_item_list; // return the draw item list;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_draw_list_page', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }

    async open_order_list_page(__retry_cnt = undefined, parse = true){

        let headers = this.__get_open_page_header();
        headers['sec-fetch-site'] = 'same-origin';
        headers['upgrade-insecure-requests'] = 1;

        __retry_cnt = __retry_cnt === undefined ? this.__req_retry_cnt : __retry_cnt;

        for(var i = 0; i < __retry_cnt; i++){
            try{
                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/ko_kr/account/orders', headers);

                if(res.status != 200){
                    throw new Error('open_order_list_page : response ' + res.status);
                }
    
                if(parse === true){
                    const $ = cheerio.load(res.data);
                    const order_info_list = parse_order_list_page($, this);
                    return order_info_list.length === 0 ? undefined :  order_info_list;
                }else{
                    return undefined;
                }

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_order_list_page', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return undefined;
    }


    async open_cancel_order_page(order_info, retry_cnt = undefined){

        const headers = {
            'authority': BrowserContext.NIKE_DOMAIN_NAME,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + '/kr/ko_kr/account/orders',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest',
        }

        retry_cnt = retry_cnt === undefined ? this.__req_retry_cnt : retry_cnt;

        for(var i = 0; i < retry_cnt; i++){
            try{
                const params = {
                    _ : new Date().getTime()
                };

                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/ko_kr/account/order/cancel/' + order_info.order_id, headers, params);

                if(res.status != 200){
                    throw new Error('open_cancel_order_page : response ' + res.status);
                }

                if(res.data.includes('주문 취소') === false){
                    throw new Error('open_cancel_order_page : invalid res data');
                }
    
                this.__set_cookie(this.__cookie_storage, res);

                return true;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'open_cancel_order_page', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return false;
    }

    async partial_cancel_calculator(order_info, retry_cnt = undefined){

        const payload_obj = {
            orderItemId : parseInt(order_info.order_item_id), 
            quantity : parseInt(order_info.quantity.replace(/\D/g, '')),
            csrfToken : this.csrfToken
        };

        let payload = new URLSearchParams(payload_obj).toString();

        const headers = {
            "authority": BrowserContext.NIKE_DOMAIN_NAME,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-length': payload.length,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': BrowserContext.NIKE_URL,
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + '/kr/ko_kr/account/orders',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        retry_cnt = retry_cnt === undefined ? this.__req_retry_cnt : retry_cnt;

        for(var i = 0; i < retry_cnt; i++){
            try{
                
                const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/ko_kr/account/order/partial-cancel-calculator/' + order_info.order_id, headers, payload);

                if(res.status != 200){
                    throw new Error('partial_cancel_calculator : response ' + res.status);
                }
    
                this.__set_cookie(this.__cookie_storage, res);
    
                if((res.data instanceof Object) == false){
                    throw new Error('partial_cancel_calculator : unexpected data : data is not object type');
                }
    
                if(('result' in res.data) === false){
                    throw new Error('partial_cancel_calculator : unexpected data : \'result\' information is not exist.');
                }

                return res.data.result;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'partial_cancel_calculator', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return false;
    }

    async cancel_order(order_info, retry_cnt = undefined){

        const payload_obj = {
            orderItemId : parseInt(order_info.order_item_id), 
            quantity : parseInt(order_info.quantity.replace(/\D/g, '')),
            csrfToken : this.csrfToken
        };

        let payload = new URLSearchParams(payload_obj).toString();

        const headers = {
            "authority": BrowserContext.NIKE_DOMAIN_NAME,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-length': payload.length,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': BrowserContext.NIKE_URL,
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + '/kr/ko_kr/account/orders',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        retry_cnt = retry_cnt === undefined ? this.__req_retry_cnt : retry_cnt;

        for(var i = 0; i < retry_cnt; i++){
            try{
                
                const res = await this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/ko_kr/account/order/cancel/' + order_info.order_id, headers, payload);

                if(res.status != 200){
                    throw new Error('cancel_order : response ' + res.status);
                }
    
                this.__set_cookie(this.__cookie_storage, res);
    
                if((res.data instanceof Object) == false){
                    throw new Error('cancel_order : unexpected data : data is not object type');
                }
    
                if(('result' in res.data) === false){
                    throw new Error('cancel_order : unexpected data : \'result\' information is not exist.');
                }

                return res.data.result;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'cancel_order', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return false;
    }

    async cleanup_cart(retry_cnt = undefined){

        const headers = {
            'authority': BrowserContext.NIKE_DOMAIN_NAME,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + '/kr/ko_kr/cart',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        }

        retry_cnt = retry_cnt === undefined ? this.__req_retry_cnt : retry_cnt;

        for(var i = 0; i < retry_cnt; i++){
            try{
                
                const res = await this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/ko_kr/cart/removeAll', headers);

                if(res.status != 200){
                    throw new Error('cleanup_cart : response ' + res.status);
                }
    
                return true;

            }catch(e){
                log.error(common.get_log_str('browser_context.js', 'cleanup_cart', e));
                await this.__post_process_req_fail(e, this.__req_retry_interval);
            }
        }

        return false;
    }
}

module.exports.BrowserContext = BrowserContext;