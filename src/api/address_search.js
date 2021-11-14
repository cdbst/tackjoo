const axios = require('axios');

const ADDR_SEARCH_API_URL = 'https://api.poesis.kr/post/search.php';

function search_address(address, __callback){

    let cur_date_tiem = new Date().getTime();

    let params = {
        q : address,
        v : '3.0.0-com.nike',
        _ : cur_date_tiem
    }

    let headers = {
        'authority': 'api.poesis.kr',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'origin': 'https://www.nike.com',
        'pragma': 'no-cache',
        'referer': 'https://www.nike.com/',
        'sec-ch-ua': '"Chromium";v="94", " Not A;Brand";v="99", "Whale";v="2"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': "Windows",
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.118 Whale/2.11.126.23 Safari/537.36'
    }

    let config = {
        params : params,
        headers : headers
    }

    axios.get(ADDR_SEARCH_API_URL, config)
    .then(function (res) {

        if(res.data.error != ''){
            __callback(res.error, undefined);
            return;
        }

        __callback(undefined, res.data.results);
    })
    .catch(function (error) {
        __callback(error, undefined);
    })
}

module.exports.search_address = search_address;

