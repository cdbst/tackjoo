const cookie = require('cookie');

class CookieManager{

    constructor(...args){

        this.add_cookie_data = this.add_cookie_data.bind(this);
        this.remove_cookie_data = this.remove_cookie_data.bind(this);
        this.get_serialized_cookie_data = this.get_serialized_cookie_data.bind(this);
        this.add_serialized_cookies = this.add_serialized_cookies.bind(this);
        this.get_specific_serialized_cookie = this.get_specific_serialized_cookie.bind(this);
        this.__init = this.__init.bind(this);
        this.__init_by_json = this.__init_by_json.bind(this);
        this.reset = this.reset.bind(this);

        if(args.length == 0){
            this.__init();
        }else if(args.length == 1){
            this.__init_by_json(args[0]);
        }else{
            throw new Error("Cannot create CookieManager instance " + args.join(' '));
        }
        
    }

    __init(){
        this.cookies = {};
        this.num_of_cookies = 0;
    }

    __init_by_json(json){
        Object.assign(this, json);
    }

    reset(){
        this.__init();
    }

    add_cookie_data(cookie_data){
        let parsed_data = cookie.parse(cookie_data);

        let cookie_keys = Object.keys(parsed_data);
        let cookie_name = cookie_keys[0];
        let cookie_value = parsed_data[cookie_name].split(';')[0].trim();
        
        if(cookie_name in this.cookies == false) this.num_of_cookies++;
        this.cookies[cookie_name] = cookie_value;

    }

    add_serialized_cookies(serialized_cookies){
        let cookies = serialized_cookies.split(';');
        let add_cookie_data = this.add_cookie_data;
        cookies.forEach((cookie)=>{
            add_cookie_data(cookie.trim());
        });
        //console.log('test');
    }

    remove_cookie_data(cookie_name){
        if(cookie_name in this.cookies == false) return;
        delete this.cookies[cookie_name];
        this.num_of_cookies--;
    }

    get_serialized_cookie_data(){
        let serialized = '';

        let i = 0;
        for (const [key, value] of Object.entries(this.cookies)) {
            serialized += (key + '=' + value);
            if(i < this.num_of_cookies - 1) serialized += '; ';
            i++;
        }

        return serialized;
    }

    get_specific_serialized_cookie(cookie_name){
        if(cookie_name in this.cookies == false) return ''
        return cookie_name + '=' + this.cookies[cookie_name]
    }
}

module.exports.CookieManager = CookieManager;