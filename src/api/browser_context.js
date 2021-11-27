const CookieManager = require("./cookie_mngr.js").CookieManager;
const axios = require('axios');
const cheerio = require('cheerio');
const product_page_parser = require('./product_page_parser.js');
const checkout_page_parser = require('./checkout_page_parser.js');
const gen_sensor_data = require("../ipc_main_sensor.js").gen_sensor_data;
const common = require("../common/common.js");
const Mutex = require('async-mutex').Mutex;

class BrowserContext {

    static NIKE_DOMAIN_NAME = 'www.nike.com';
    static NIKE_URL = 'https://www.nike.com';
    static USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36';
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
        this.send_fake_sensor_data = this.send_fake_sensor_data.bind(this);
        this.cancel_request = this.cancel_request.bind(this);
        this.__request_canceled_check = this.__request_canceled_check.bind(this);

        this.__http_request = this.__http_request.bind(this);
        this.__http_request2 = this.__http_request2.bind(this);
        this.__recorver_session = this.__recorver_session.bind(this);
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

        this.clear_cookies = this.clear_cookies.bind(this);
        this.clear_csrfToken = this.clear_csrfToken.bind(this);
        
        if(args.length == 3 || args.length == 0){
            this.__init.apply(null, args); // email, pwd, id
        }else if(args.length == 1){
            this.__init_by_json(args[0]); //json string.
        }else{
            throw new Error("Cannot initalize BrowserContext instance " + args.join(' '));
        }
    }

    __init(_email, _pwd, _id){

        this.email = _email;
        this.pwd = _pwd;
        this.id = _id;

        this.in_progress_login = false;
        this.is_login = false;

        this.csrfToken = undefined;
        this.sensor_data_server_url = undefined;

        //(TODO : 사용자 인터페이스로부터 입력받은 설정값을 Base로 지정될 수 있도록 기능 추가가 필요함.)
        this.__req_retry_interval = 1500; // app 설정으로 부터 지정되어야 할 값임.
        this.__req_retry_cnt = 30;
        this.__req_timout = 0;

        this.__cookie_storage = new CookieManager();
        this.__cookie_storage.add_cookie_data('social_type=comlogin');
        this.__cookie_storage.add_cookie_data('NikeCookie=ok');

        this.__iamport_cookie_storage = new CookieManager();
        this.__on_cart_mutex = new Mutex();

        this.request_canceler = {};
    }

    __init_by_json(json){
        Object.assign(this, json);
        this.__cookie_storage = new CookieManager(json.__cookie_storage);
        this.__iamport_cookie_storage = new CookieManager(json.__iamport_cookie_storage);
        this.__on_cart_mutex = new Mutex();
    }

    __recorver_session(__callback){

        this.clear_cookies();
        this.clear_csrfToken();
        this.open_main_page(()=>{
            this.login(__callback);
        });
    }

    async send_fake_sensor_data(){

        try{

            const sensor_data = await gen_sensor_data();
            await this.send_sensor_data(sensor_data);
            return true;

        }catch(e){
            console.error(e);
            return false;
        }
    }

    cancel_request(request_id){
        this.request_canceler[request_id] = true;
    }
    
    __request_canceled_check(request_id){
        if(request_id in this.request_canceler == false) return false;
        if(this.request_canceler[request_id] == false) return false;

        delete this.request_canceler[request_id];
        return true;
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

    __http_request(method, url, headers, params, __callback, req_cfg = undefined){

        let cfg_expected_status = undefined;
        let cfg_expected_keys = undefined;
        let cfg_need_csrfToken = undefined;
        let request_id = common.uuidv4();
        let max_redirect = undefined;
        let ret_interval = this.__req_retry_interval;
        
        if(req_cfg != undefined){
            if('expected_status' in req_cfg) cfg_expected_status = req_cfg['expected_status'];
            if('expected_keys' in req_cfg) cfg_expected_keys = req_cfg['expected_keys'];
            if('need_csrfToken' in req_cfg) cfg_need_csrfToken = req_cfg['need_csrfToken'];
            if('request_id' in req_cfg) request_id = req_cfg['request_id'];
            if('max_redirect' in req_cfg) max_redirect = req_cfg['max_redirect'];
            if('ret_interval' in req_cfg) ret_interval = req_cfg['ret_interval'];
        }

        if(this.__request_canceled_check(request_id)){
            __callback('request has been canceled.', undefined);
            return;
        }

        this.request_canceler[request_id] = false;

        let req = (retry, cb) => {

            
            if(this.__request_canceled_check(request_id)){
                __callback('request has been canceled.', undefined);
                return;
            }

            let cookie_storage = this.__judge_cookie_storage(url);
            headers['cookie'] = cookie_storage.get_serialized_cookie_data();

            let axios_req_cfg = {
                method: method,
                url: url,
                timeout: this.__req_timout,
                headers : headers
            }

            if(max_redirect != undefined){
                axios_req_cfg.maxRedirects = max_redirect;
            }

            if(params != undefined){
                if(method == BrowserContext.REQ_METHOD.POST){
                    axios_req_cfg['data'] = params;
                }else{
                    axios_req_cfg['params'] = params;
                }
            }
            
            axios(axios_req_cfg)
            .then(res => {

                if(cfg_expected_status != undefined && cfg_expected_status.includes(res.status) == false){
                    throw new Error('unexpected status code ' + res.status);
                }else if(res.status != 200 && res.status != 201){
                    throw new Error('invalid status code ' + res.status);
                }

                if(cfg_need_csrfToken != undefined && cfg_need_csrfToken == true){
                    const $ = cheerio.load(res.data);
                    let csrfToken = this.__get_csrfToken($);

                    if(csrfToken == undefined){
                        throw new Error('GET data has no csrfToken information');   
                    }
                }

                if(cfg_expected_keys != undefined){
                    if(typeof res.data !== 'object'){
                        throw new Error('expected payload data is not object type');
                    }
                    let data_keys = Object.keys(res.data);
                    let intersection = cfg_expected_keys.filter(x => data_keys.includes(x));
                    if(intersection.length == 0){
                        throw new Error('expected payload data has no expected key');
                    }
                }

                cb(undefined, retry, res);
            })
            .catch(error => {

                if(cfg_expected_status != undefined && cfg_expected_status.includes(error.response.status)){
                    cb(undefined, retry, error.response);
                    return;
                }

                this.__remove_aws_cookies();
                this.__remove_akam_cookies();
                cb(error, retry, undefined);
            });
        }

        let req_cb = (err, retry, res) =>{

            if(this.__request_canceled_check(request_id)){
                __callback('request has been canceled.', undefined);
                return;
            }

            if(err){
                if(retry == 0){
                    delete this.request_canceler[request_id];
                    __callback(err, undefined);
                }else{
                    setTimeout(()=>{
                        req(--retry, req_cb);
                    }, ret_interval); 
                }
            }else{
                delete this.request_canceler[request_id];
                __callback(undefined, res);
            }
        }

        req(this.__req_retry_cnt, req_cb);
        return request_id;
    }

    async __http_request2(method, url, headers, params, send_sensor_data = true){

        if(send_sensor_data){
            await this.send_fake_sensor_data();
        }

        let cookie_storage = this.__judge_cookie_storage(url);
        headers['cookie'] = cookie_storage.get_serialized_cookie_data();

        let axios_req_cfg = {
            method: method,
            url: url,
            timeout: this.__req_timout,
            headers : headers
        }

        // let max_redirect = undefined;
        // if(req_cfg != undefined){
        //     if('max_redirect' in req_cfg) max_redirect = req_cfg['max_redirect'];
        // }
        
        // if(max_redirect != undefined){
        //     axios_req_cfg['maxRedirects'] = max_redirect;
        // }


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

    open_page(url, __callback){

        let headers = this.__get_open_page_header();

        if(this.__cookie_storage.num_of_cookies > 0){
            headers['cookie'] = this.__cookie_storage.get_serialized_cookie_data();
        }

        this.__http_request(BrowserContext.REQ_METHOD.GET, url, headers, undefined, (err, res) =>{

            if(err){
                if(__callback) __callback(err);
                return;
            }

            if(res.status != 200){
                if(__callback) __callback('open_main_page : response ' + res.status);
                return;
            }

            const $ = cheerio.load(res.data);

            let result = this.__post_process_open_page(res.headers, $);
            if(result == false){
                if(__callback) __callback('open_main_page : cannot store informations');
                return;
            }

            if(__callback) __callback(undefined, res);
        },{need_csrfToken : true});
    }

    async send_sensor_data(sensor_data){

        if(this.sensor_data_server_url == undefined){
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

            const res = await this.__http_request2(BrowserContext.REQ_METHOD.POST, this.sensor_data_server_url, headers, sensor_data, false);

            if(res.status == 201 || res.status == 200){

                let result = this.__set_cookie(this.__cookie_storage, res);
                if(result == false){
                    throw new Error('send_sensor_data - fail with recving akam sensor cookies :' + res.status);    
                }

            }else{
                throw new Error('send_sensor_data - response invalid status code :' + res.status);
            }

        }catch(e){
            throw e;
        }
    }

    login(__callback){
        if(this.in_progress_login){
            __callback('inprogress login in work.')
            return;
        }
        
        this.in_progress_login = true;

        if(this.is_anonymous()){
            this.in_progress_login = false;
            __callback('This browser context is anonymous');
            return;
        }

        this.__open_login_modal(err =>{

            if(err) console.warn(err); // 이것은 그냥 경고 처리만 일단 하는 것으로 함.

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
            let cookies = this.__cookie_storage.get_serialized_cookie_data();

            let headers = {
                'authority': BrowserContext.NIKE_DOMAIN_NAME,
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'cache-control': 'no-cache',
                'content-length': payload.length,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'cookie': cookies,
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

            
            this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/ko_kr/login_post.htm', headers, payload, (err, res) =>{

                this.in_progress_login = false;

                if(err){
                    __callback(err);
                    return;
                }

                if(res.data.ResponseObject.isError == 'true'){
                    __callback('login fail - response server data is error status.');
                    return;
                }

                this.__set_cookie(this.__cookie_storage, res);
                
                this.is_login = true;
                this.open_main_page(__callback);

            }, {expected_keys : ['ResponseObject']});

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

            this.__set_cookie(this.__cookie_storage, res);
            
            __callback(undefined);
        })
        .catch(err => {
            this.__remove_aws_cookies();
            this.__remove_akam_cookies();
            __callback(err);
        });
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
            //'connection': 'keep-alive',
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
        this.__cookie_storage.init();
    }
    
    clear_csrfToken(){
        this.csrfToken = undefined;
    }

    open_main_page(__callback = undefined){

        let headers = this.__get_open_page_header();

        if(this.__cookie_storage.num_of_cookies > 0){
            headers['cookie'] = this.__cookie_storage.get_serialized_cookie_data();
        }

        this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/ko_kr', headers, undefined, (err, res) =>{

            if(err){
                if(__callback) __callback(err);
                return;
            }

            if(res.status != 200){
                if(__callback) __callback('open_main_page : response ' + res.status);
                return;
            }

            const $ = cheerio.load(res.data);

            let result = this.__post_process_open_page(res.headers, $);
            if(result == false){
                if(__callback) __callback('open_main_page : cannot store informations');
                return;
            }

            if(__callback) __callback();
        },{need_csrfToken : true});
    }

    open_feed_page(__callback){

        let headers = this.__get_open_page_header();

        this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/launch/', headers, undefined, (err, res) =>{

            if(err){
                __callback(err);
                return;
            }

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
        });
    }

    async open_product_page(product_url){

        let product_info = undefined;

        this.__cookie_storage.add_cookie_data('oldCartId=none');
        let headers = this.__get_open_page_header();

        for(var i = 0; i < this.__req_retry_cnt; i++){

            try{

                const res = await this.__http_request2(BrowserContext.REQ_METHOD.GET, product_url, headers, undefined, true);

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
                this.__remove_aws_cookies();
                this.__remove_akam_cookies();
                console.error(e);
            }
        }

        if(product_info == undefined) return undefined;
        if(product_info.sell_type != common.SELL_TYPE.normal) return product_info;

        let sku_inventory_info = await this.get_product_sku_inventory(product_url, product_info.product_id);
        if(sku_inventory_info == undefined) return undefined;

        product_page_parser.update_product_info_as_sku_inventory_info(product_info, sku_inventory_info);
        return product_info;
    }

    async get_product_sku_inventory(product_url, product_id){

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

        let params = {
            productId : product_id,
            _ : new Date().getTime()
        };

        for(var i = 0; i < this.__req_retry_cnt; i++){

            try{
                const res = await this.__http_request2(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/launch/productSkuInventory', headers, params);

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
                this.__remove_aws_cookies();
                this.__remove_akam_cookies();
                console.error(e);
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

                const res = await this.__http_request2(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/launch/theDraw/entry', headers, payload);

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
                this.__remove_aws_cookies();
                this.__remove_akam_cookies();
                console.error(e);
            }
        }

        return undefined;
    }

    add_to_cart(product_info, size_info, csrfToken, __callback){

        let _request_id = common.uuidv4();

        this.__on_cart_mutex
        .acquire()
        .then((release) => {
            
            let payload_obj = {
                'SIZE' : size_info['id'],
                'quantity' : 1,
                'csrfToken' : csrfToken,
                'productId' : product_info['product_id']
            };
    
            payload_obj[product_info.item_attr] = size_info['name'];
    
            let payload = new URLSearchParams(payload_obj).toString()
            let cookies = this.__cookie_storage.get_serialized_cookie_data();
    
            let headers = {
                "authority": BrowserContext.NIKE_DOMAIN_NAME,
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control" : "no-cache",
                "content-length": payload.length, // must be fixed
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie": cookies,
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
    
            this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/launch/cart/add?directOrder=true', headers, payload, (err, res) =>{
    
                if(err){
                    __callback(err, release);
                    return;
                }
    
                if(res.status != 200){
                    __callback('add_to_cart : invalid response status code.' + res.status, release);
                    return;
                }

                this.__set_cookie(this.__cookie_storage, res);
    
                if(('quantityAdded' in res.data) == false || ('cartItemCount' in res.data) == false){
                    __callback('add_to_cart : recv invalid payload.', release);
                    return;
                }
    
                __callback(undefined, release, res.data);
    
            }, {expected_keys : ['quantityAdded', 'cartItemCount'], request_id : _request_id});
        });

        return _request_id;
    }

    open_checkout_page(product_info, __callback){

        let headers = this.__get_open_page_header();
        headers['cookie'] = this.__cookie_storage.get_serialized_cookie_data();
        headers['sec-fetch-site'] = 'same-origin';
        headers['refer'] = product_info.url;
        headers['upgrade-insecure-requests'] = 1;
        
        return this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/launch/checkout', headers, undefined, (err, res) =>{

            if(err){
                __callback(err, undefined);
                return;
            }

            if(res.status != 200){
                __callback('open_checkout_page : response ' + res.status, undefined);
                return;
            }

            const $ = cheerio.load(res.data);

            let result = this.__post_process_open_page(res.headers, $);
            if(result == false){
                __callback('open_checkout_page : cannot store informations', undefined);
                return;
            }

            __callback(undefined, this.csrfToken)

        }, {need_csrfToken : true});
    }

    checkout_request(__callback){

        let headers = {
            'accept':' */*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'cookie': this.__cookie_storage.get_serialized_cookie_data(),
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + '/kr/launch/checkout',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile':' ?0',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        let params = {
            pay_method: 'point',
            gToken: '',
            _: new Date().getTime()
        }
        
        return this.__http_request(BrowserContext.REQ_METHOD.GET, BrowserContext.NIKE_URL + '/kr/launch/checkout/request', headers, params, (err, res) =>{

            if(err){
                __callback(err, undefined);
                return;
            }

            if(res.status != 200){
                __callback('checkout_request : response ' + res.status, undefined);
                return;
            }

            __callback(undefined, res.data);
        }, {expected_keys : ['total_amount'], ret_interval : 300});

    }

    checkout_singleship(billing_info, csrfToken, __callback){

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
            'csrfToken': csrfToken
        }

        let payload = new URLSearchParams(payload_obj).toString();
        let cookie = this.__cookie_storage.get_serialized_cookie_data();
        
        let headers = {
            'authority': BrowserContext.NIKE_DOMAIN_NAME,
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-length': payload.length,
            'content-type': 'application/x-www-form-urlencoded',
            'cookie': cookie,
            'origin': BrowserContext.NIKE_URL,
            'pragma': 'no-cache',
            'referer': BrowserContext.NIKE_URL + '/kr/launch/checkout',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': 1,
            'user-agent': BrowserContext.USER_AGENT
        }
        
        return this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.NIKE_URL + '/kr/launch/checkout/singleship', headers, payload, (err, res) =>{

            if(err){
                __callback(err);
                return;
            }

            this.__set_cookie(this.__cookie_storage, res);

            //location is checkout page.
            this.open_page(res.headers.location, (err, res) =>{

                if(err){
                    __callback(err);
                    return;
                }

                const $ = cheerio.load(res.data);

                let kakaopay_prepare_payload = checkout_page_parser.parse_kakaopay_prepare_payload_from_checkout_page($);
                if(kakaopay_prepare_payload == undefined){
                    throw new Error('cannot parse payment payload from checkout page.');
                }
                __callback(err, kakaopay_prepare_payload);
            });


        },{expected_status : [301, 302, 303, 304], max_redirect : 0});
    }

    prepare_kakao_pay(prepare_pay_payload, __callback){

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
            'referer': 'https://nike-service.iamport.kr/payments/ready/imp35948874/kakaopay/CA00004A62',
            'sec-ch-ua': BrowserContext.SEC_CA_UA,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': BrowserContext.USER_AGENT,
            'x-requested-with': 'XMLHttpRequest'
        };

        return this.__http_request(BrowserContext.REQ_METHOD.POST, BrowserContext.IAMPORT_URL + '/kakaopay_payments/prepare.json', headers, payload, (err, res)=> {

            if(err){
                __callback(err);
                return;
            }

            if(res.data.code != 0){
                __callback('prepare pay fail : result code is ' + res.data.code + '  msg :' + res.data.msg);
                return;
            }

            this.__set_cookie(this.__iamport_cookie_storage, res);

            __callback(undefined, res.data.data.kakaoData);
        }, {expected_keys : ['data']});
    }
}

module.exports.BrowserContext = BrowserContext;