// test node app
const fs = require('fs');

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const body_parser = require('body-parser');
const app = express();
app.use(body_parser.json());
app.use(body_parser.text());
app.use(express.static('public'));
app.use(body_parser.urlencoded({ extended: true }));

const root_cas = require('ssl-root-cas').create();
const https = require('https');

const cookie_mngr = require('./cookie_mngr.js');


https.globalAgent.options.ca = root_cas;

const port = 3000;

let g_csrfToken = undefined;
let g_customer_id = undefined;
let g_ping_url = undefined;

let g_cookie_storage = new cookie_mngr.CookieManager();
g_cookie_storage.add_cookie_data('NikeCookie=ok');
g_cookie_storage.add_cookie_data('social_type=comlogin');
g_cookie_storage.add_cookie_data('s_ips=1251');
g_cookie_storage.add_cookie_data('s_tp=11459');


const g_essential_cookies_to_login = new cookie_mngr.CookieManager();


fs.readFile('./essential_cookies_to_login.txt', 'utf8', function(err, data){
    g_essential_cookies_to_login.add_cookie_data(data);
});


app.get('/akam_sensor_gen.js_modified.js', (req, res) =>{
    res.sendFile(__dirname + '\\akam_sensor_gen.js_modified.js');
});

app.get('/test.js', (req, res) =>{
    res.sendFile(__dirname + '\\test.js');
});

app.get('/node_modules/jquery/dist/jquery.min.js', (req, res) =>{
    res.sendFile(__dirname + '\\node_modules\\jquery\\dist\\jquery.min.js');
});

app.get('/test', (req, res) =>{
    res.sendFile(__dirname + '\\test.html');
});

app.get('/test2', (req, res) =>{
    res.sendFile(__dirname + '\\test2.html');
});

app.get('/test', (req, res) =>{
    res.sendFile(__dirname + '\\test.html');
});

app.post('/sensor_data', (req, res) =>{
    get_akam_cookies(req.body, (data, cookies)=>{
        let res_data = {'data' : data, 
            'cookies' : cookies
        };
        res.send(JSON.stringify(res_data));
    });
});

app.post('/login', (req, res) =>{
    do_login(req.body.id, req.body.pwd, (data, cookies) =>{
        let res_data = {'data' : data, 
            'cookies' : cookies
        };
        res.send(JSON.stringify(res_data));
    });
});

app.listen(port, ()=>{
    console.log('web server on');
});

function get_akam_cookies(sensor_data, cb){
    
    let data = JSON.stringify(sensor_data); // to debugging
    let data_len = data.length;
    let _cookies = g_cookie_storage.get_cookie_data();

    let config = {
        headers: {
            "authority": 'www.nike.com',

            "accept": "*/*",
            "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "no-cache",
            "content-type": "text/plain;charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"90\", \" Not A;Brand\";v=\"99\", \"Whale\";v=\"2\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "cookie": _cookies,
            "origin": 'https://www.nike.com',
            "referer": "https://www.nike.com/kr/ko_kr",
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36',
            'content-length': data_len
        }
    }

    axios.post('https://www.nike.com' + g_ping_url, sensor_data, config)
    .then(res => {
        if(res.status == 201){
            res.headers['set-cookie'].forEach(cookie_data =>{
                g_cookie_storage.add_cookie_data(cookie_data);
            });
            cb(res.data, g_cookie_storage.cookies);
        }else{
            cb(res.data, g_cookie_storage.cookies);
        }
    })
    .catch(error => {
        console.error(error)
        cb('axios post sensor data' + g_cookie_storage.cookies);
    });
}

function do_login(id, pwd, cb) {

    console.log('========================= [cookie test start] =========================');

    let es_cookies = JSON.parse(JSON.stringify(g_essential_cookies_to_login.cookies));

    for (const [key, value] of Object.entries(g_cookie_storage.cookies)) {
        if(key in es_cookies == false) continue;
        delete es_cookies[key];
    }


    console.log('more needed cookies here!!!>' );
    for (const [key, value] of Object.entries(es_cookies)) {
        console.log(key);
    }

    console.log('========================= [cookie test end] =========================');


    let data = {
        'locale': 'ko_KR',
        'dynamicForm': 'login',
        'templatePath': '/authentication/login',
        'userId': '',
        'j_username': id,
        'j_password': pwd,
        'breeze-me': 'on',
        'breeze-me': 'off',
        'csrfToken': g_csrfToken
    }

    let data_len = JSON.stringify(data).length;
    let _cookies = g_cookie_storage.get_cookie_data();

    let config = {
        headers: {
            'authority': 'www.nike.com',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-length': data_len,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': _cookies,
            'origin': 'https://www.nike.com',
            'pragma': 'no-cache',
            'referer': 'https://www.nike.com/kr/ko_kr/',
            'sec-ch-ua': '"Chromium";v="90", " Not A;Brand";v="99", "Whale";v="2"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        }
    }

    axios.post('https://www.nike.com/kr/ko_kr/login_post.htm', data, config)
    .then(res => {
        if(res.status == 200){
            res.headers['set-cookie'].forEach(cookie_data =>{
                g_cookie_storage.add_cookie_data(cookie_data);
            });
            cb(res.data, g_cookie_storage.cookies);
        }else{
            cb(res.data, g_cookie_storage.cookies);
        }
    })
    .catch(error => {
        console.error(error)
        cb('axios login error', g_cookie_storage.cookies);
    });
}

function access_main_page(cb){

    axios.get('https://www.nike.com/kr/ko_kr')
    .then(res => {

        if(res.status == 200){
            // g_cookies = [];
            res.headers['set-cookie'].forEach(cookie_data =>{
                g_cookie_storage.add_cookie_data(cookie_data);
            });

            const $ = cheerio.load(res.data);
            l_csrfToken_el = $('[name=csrfToken]');

            if(l_csrfToken_el.length > 0) {
                g_csrfToken = l_csrfToken_el[0].attribs.value;   
            }

            let scripts = $('script:not([src])').get();
            let data_script = undefined;
            for(var i = 0 ; i < scripts.length; i++){
                
                let script = scripts[i];
                if(('type' in script.attribs) == false){
                    
                    script_data = script.children[0].data;
                    
                    if(script_data.includes('var _GLOBAL =')){
                        data_script = script;
                        break;
                    }
                }
            }

            let setting_data = data_script.children[0].data;
            g_customer_id = setting_data.split('ID :')[1].split(',')[0].trim();
            g_cookie_storage.add_cookie_data('USERID=' + g_customer_id);

            scripts = $('script').get();

            for(var i = 0; i < scripts.length; i++){

                let script = scripts[i];
                if(('src' in script.attribs) == false) continue;

                if((script.attribs.src.includes('https://'))) continue;
                if((script.attribs.src.startsWith('//'))) continue;
                console.log(script.attribs.src);
                g_ping_url = script.attribs.src;
                break;
            }

        }else{
            console.log('req fail - status code : ' + res.status);
        }
        
    })
    .catch(error => {
        console.error(error)
    });
}

access_main_page(function(){
    //do_login(id, pwd);
});


