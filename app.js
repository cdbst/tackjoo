// test node app

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const body_parser = require('body-parser');
const app = express();
app.use(body_parser.json());
app.use(express.static('public'));
const port = 3000;

let g_cookies = ['NikeCookie=ok;', 'social_type=comlogin;'];
let g_csrfToken = undefined;
let g_customer_id = undefined;

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
    var body = req.body;
    res.send(JSON.stringify({'msg' :'POST request to the homepage'}));
});

app.listen(port, ()=>{
    console.log('web server on');
});

function do_login(id, pwd, cb) {

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

    let config = {
        headers: {
            'accept':'application/json, text/javascript, */*; q=0.01',
            'accept-encoding':'gzip, deflate, br',
            'accept-language':'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control':'no-cache',
            // 'content-length': data_len,
            'content-type':'application/x-www-form-urlencoded; charset=UTF-8',
            'content-length': data_len,
            'cookie': g_cookies.join(' '),
            'origin':'https://www.nike.com',
            'pragma':'no-cache',
            'referer':'https://www.nike.com/kr/ko_kr/',
            'sec-ch-ua':"\"Chromium\";v=\"90\", \" Not A;Brand\";v=\"99\", \"Whale\";v=\"2\"",
            'sec-ch-ua-mobile':'?0',
            'sec-fetch-dest':'empty',
            'sec-fetch-mode':'cors',
            'sec-fetch-site':'same-origin',
            'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.232 Whale/2.10.124.26 Safari/537.36',
            'x-requested-with':'XMLHttpRequest',
        }
    }


    axios.post('https://www.nike.com/kr/ko_kr/login_post.htm', data, config)
    .then(res => {

        if(res.status == 200){
            console.log(res.data);
        }else{
            console.log('req fail - status code : ' + res.status);
        }
        
        read_stock_tiker();
    })
    .catch(error => {
        console.error(error)
    });
}

function access_main_page(cb){

    axios.get('https://www.nike.com/kr/ko_kr')
    .then(res => {

        if(res.status == 200){
            // g_cookies = [];
            res.headers['set-cookie'].forEach(cookie_data =>{
                cookie = cookie_data.split(' ');
                g_cookies.push(cookie[0]);
            });

            const $ = cheerio.load(res.data);
            l_csrfToken_el = $('[name=csrfToken]');

            if(l_csrfToken_el.length > 0) {
                g_csrfToken = l_csrfToken_el[0].attribs.value;   
            }

            let scripts = $('script:not([src])').get()
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
            //g_cookies.push('USERID=' + g_customer_id +';');
            cb();

        }else{
            console.log('req fail - status code : ' + res.status);
        }
        
    })
    .catch(error => {
        console.error(error)
    });
}

function ak_ping(){
    
}

// access_main_page(function(){
//     do_login(id, pwd);
// });


