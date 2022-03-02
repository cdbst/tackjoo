const axios = require('axios');
const { uuidv4, get_log_str, is_valid_currency_format, get_YYYYMMDDhhmmss } = require('../common/common');
const log = require('electron-log');
const cheerio = require('cheerio');

const KREAM_URL = 'https://kream.co.kr';
const KREAM_API_URL = KREAM_URL + '/api';

function get_req_headers(){
    return {
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'referer': KREAM_URL + '/',
        'sec-ch-ua': ' Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': "Windows",
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'x-kream-api-version': 7,
        'x-kream-client-datetime': get_YYYYMMDDhhmmss(new Date()) + '+0900',
        'x-kream-device-id': 'web;' + uuidv4()
    };
}

async function get_kream_product_price(product_info){

    if(product_info.model_id === undefined) return undefined;

    const axios_req_cfg = {
        method: 'GET',
        url: KREAM_API_URL + '/p/products/suggest',
        headers : get_req_headers(),
        params : {
            per_page : 10,
            keyword : product_info.model_id.trim(),
            request_key : uuidv4()
        }
    };
    
    try{
        const res = await axios(axios_req_cfg);
        if(res.data === undefined || res.data.items === undefined || res.data.items.length === 0) return undefined;

        const product_meta_info = res.data.items[0];

        let retry = 6;

        while(retry--){
            const recently_trade_price = await parse_kream_product_page(product_meta_info.id);
            if(recently_trade_price === undefined) return undefined;
            else if(is_valid_currency_format(recently_trade_price)) return recently_trade_price;
        }

    }catch(err){
        log.error(get_log_str('kream_mngr.js', 'get_kream_product_price', err));
        return undefined;
    }
}

async function parse_kream_product_page(kream_product_id){

    const axios_req_cfg = {
        method: 'GET',
        url: 'https://kream.co.kr/products/' + kream_product_id
    };

    try{
        const res = await axios(axios_req_cfg);
        const $ = cheerio.load(res.data);
        const el_num_list = $('.num');

        const recently_trade_price = el_num_list[0].children[0].data;
        return recently_trade_price;
    }catch(err){
        log.error(get_log_str('kream_mngr.js', 'parse_kream_product_page', err));
        return undefined;
    }   
}

module.exports.get_kream_product_price = get_kream_product_price;