const cookie = require('cookie');

class CookieManager{

    constructor(){

        this.add_cookie_data = this.add_cookie_data.bind(this);
        this.remove_cookie_data = this.remove_cookie_data.bind(this);
        this.get_cookie_data = this.get_cookie_data.bind(this);

        this.cookies = {};
        this.num_of_cookies = 0;
    }

    add_cookie_data(cookie_data){
        let parsed_data = cookie.parse(cookie_data);

        let cookie_keys = Object.keys(parsed_data);
        cookie_keys.forEach(cookie_name =>{
            if(cookie_name in this.cookies == false) this.num_of_cookies++;
            let cookie_val = parsed_data[cookie_name];
            this.cookies[cookie_name] = cookie_val;
        });
    }

    remove_cookie_data(cookie_name){
        delete this.cookies[cookie_name];
        this.num_of_cookies--;
    }

    get_cookie_data(){
        let serialized = '';

        let i = 0;
        for (const [key, value] of Object.entries(this.cookies)) {
            serialized += (key + '=' + value);
            if(i < this.num_of_cookies - 1) serialized += '; ';
            i++;
        }

        return serialized;
    }
}

module.exports.CookieManager = CookieManager;