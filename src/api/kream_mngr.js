const axios = require('axios');
const { uuidv4, get_log_str, is_valid_currency_format, get_YYYYMMDDhhmmss } = require('../common/common');
const log = require('electron-log');
const cheerio = require('cheerio');
const common = require('../common/common');

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

async function get_kream_product_info(product_info){

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
            const kream_product_info = await parse_kream_product_page(product_meta_info.id);
            if(kream_product_info === undefined) return undefined;
            else if(is_valid_currency_format(kream_product_info.price.replace(' 원', ''))) return kream_product_info;
        }

        return undefined;

    }catch(err){
        log.error(get_log_str('kream_mngr.js', 'parse_kream_product_page', err));
        return undefined;
    }
}

async function parse_kream_product_page(kream_product_id){

    const req_url = KREAM_URL + '/products/' + kream_product_id;

    const axios_req_cfg = {
        method: 'GET',
        url: req_url
    };

    try{

        const res = await axios(axios_req_cfg);
        const $ = cheerio.load(res.data);

        const kream_product_info = common.get_kream_product_info_obj_scheme();
        common.update_kream_product_info_obj(kream_product_info, 'product_id', kream_product_id);

        common.update_kream_product_info_obj(kream_product_info, 'url', req_url);

        const el_num_list = $('.num');
        const recently_trade_price = el_num_list[0].children[0].data;
        common.update_kream_product_info_obj(kream_product_info, 'price', recently_trade_price + ' 원');

        const el_wish_count_num = $('.wish_count_num');
        const product_interest = el_wish_count_num[0].children[0].data.trim();
        common.update_kream_product_info_obj(kream_product_info, 'interest', product_interest);

        common.update_kream_product_info_obj(kream_product_info, '_id', common.uuidv4());

        return kream_product_info;
    }catch(err){
        log.error(get_log_str('kream_mngr.js', 'parse_kream_product_page', err));
        return undefined;
    }   
}

module.exports.get_kream_product_info = get_kream_product_info;