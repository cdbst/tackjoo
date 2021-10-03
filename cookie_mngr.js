const cookie = require('cookie');

export class CookieManager{

    constructor(){

        this.add_cookie_data = this.add_cookie_data.bind(this);
        this.remove_cookie_data = this.remove_cookie_data.bind(this);
        this.get_cookie_data = this.get_cookie_data.bind(this);

        this.cookies = {};
    }

    add_cookie_data(cookie_data){
        let parsed_data = cookie.parse(cookie_data);

        let cookie_keys = Object.keys(parsed_data);
        cookie_keys.forEach(cookie_name =>{
            let cookie_val = parsed_data[cookie_name];
            this.cookies[cookie_name] = cookie_val;
        });
    }

    remove_cookie_data(cookie_name){
        delete this.cookies[cookie_name];
    }

    get_cookie_data(){
        return cookie.serialize(this.cookies);
    }
}