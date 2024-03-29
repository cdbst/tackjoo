const common = require('../common/common');
const { BrowserContext } = require('./browser_context');
const { 
    parse_product_list_from_new_released_page,
    parse_other_product_list_page_urls
} = require('../api/product_page_parser');
const { notify_text } = require('./notification_mngr');
const cheerio = require('cheerio');
const log = require('electron-log');
const _ = require('lodash');

class NewReleasedProductWatchdog{

    /**
     * 
     * @param {number} watch_interval 몇 초 간격으로 새로운 제품을 확인할지 (초단위)
     */
    constructor(settings_info, custom_watch_page_list){

        this.start_watch = this.start_watch.bind(this);
        this.stop_watch = this.stop_watch.bind(this);
        this.get_new_released_product_info_list = this.get_new_released_product_info_list.bind(this);
        this.open_new_released_page_test = this.open_new_released_page_test.bind(this);
        this.get_product_list_from_url = this.get_product_list_from_url.bind(this);

        this.browser_context = new BrowserContext();
        this.watch_interval = settings_info.new_product_watch_interval;
        this.watch_max_ret = settings_info.new_product_watch_max_ret;
        this.use_snkrs_url = settings_info.new_product_quick_task_use_snkrs_url === 1 ? true : false;
        this.custom_watch_page_list = [...new Set(custom_watch_page_list)];

        this.watchdog_resolver = undefined;
        this.watchdog_rejecter = undefined;
        this.stopped = false;
    }

    //a list에는 없고 b 리스트에만 존재하는 product_info를 취합하여 반환합니다.
    get_new_released_product_info_list(a_list, b_list){

        if(a_list === undefined || b_list === undefined) return [];

        const new_released_product_list = _.clone(b_list);

        var i = new_released_product_list.length;

        while (i--) {

            const new_product_info = new_released_product_list[i];
            let already_exists = false;
            a_list.every((a_product_info)=>{
                if(a_product_info.url === new_product_info.url){
                    already_exists = true;
                    return false;
                }
                return true;
            });

            if(already_exists){
                new_released_product_list.splice(i, 1);
            }
        }

        const new_released_product_list_unique = _.uniqBy(new_released_product_list, (pi)=>(pi.url)); // 중복을 제거함.
        return new_released_product_list_unique;
    }

    /**
     * 
     * @param {function} __callback 새로운 제품이 발견됐을때, 알림을 받기위한 callback.
     */
    start_watch(__callback){

        this.stopped = false;

        const default_request_url = common.NIKE_URL + '/kr/ko_kr/w/xg/xb/xc/new-releases';

        return new Promise(async (resolve, reject)=>{
            this.watchdog_resolver = resolve;
            this.watchdog_rejecter = reject;

            let prev_product_info_list = [];
            let ret_remain = this.watch_max_ret === 0 ? 1 : this.watch_max_ret;
            let accumulated_fail_cnt = 0;
            const default_req_urls = [...this.custom_watch_page_list, default_request_url];

            while(ret_remain--){

                try{
                    if(this.watch_max_ret === 0) ret_remain++;

                    if(accumulated_fail_cnt === 10){
                        notify_text('신상품 감시기능 중지', '신상품 페이지로부터 더 이상 상품 정보를 얻을수 없는 상태입니다.');
                        this.watchdog_rejecter('cannot receive product information form new release page.');
                        return;
                    }
    
                    if(this.stopped){
                        this.watchdog_rejecter('watchdog is stopped by user.');
                        return;
                    }

                    let new_product_info_list = [];

                    const p_req_list = default_req_urls.map((url)=>this.get_product_list_from_url(url));

                    const list_of_other_product_list = await Promise.all(p_req_list);
                    list_of_other_product_list.forEach(([url, product_info_list])=>{
                        if(product_info_list.length > 0){
                            new_product_info_list = [...new_product_info_list, ...product_info_list];
                        }
                        // else{
                        //     const idx = default_req_urls.indexOf(url); // 유효하지 않은 페이지의 경우, 더 이상 파싱하지 않음.
                        //     if(idx > -1) default_req_urls.splice(url, 1);
                        // }
                    });

                    if(new_product_info_list.length === 0){
                        throw new Error('new release watchdog recv empty product list');
                    }

                    const new_released_product_list = this.get_new_released_product_info_list(prev_product_info_list, new_product_info_list);
                    if(new_released_product_list.length > 0){
                        __callback(new_released_product_list);
                    }
    
                    prev_product_info_list = new_product_info_list;
                    accumulated_fail_cnt = 0; // 누적 에러 값을 초기화 시킨다.
                    await common.async_sleep(this.watch_interval * 1000);
                    
                }catch(err){
                    log.error(common.get_log_str('new_released_product_watchdog.js', 'start_watch-inner-promise', err));
                    accumulated_fail_cnt++;
                }
            }

            notify_text('신상품 감시기능 중지', `신상품을 감시하는 기능이 정지되었습니다. (${this.watch_max_ret}회 감시 완료)`);
            this.watchdog_resolver();
        });
    }

    async get_product_list_from_url(url){

        try{
            const res = await this.browser_context.open_page(url, 5);
                    
            if(res === undefined || res.data === undefined){
                throw new Error('invalid page error - res is invalid')
            } 
    
            const $ = cheerio.load(res.data);
            const new_product_info_list = await parse_product_list_from_new_released_page($, this.use_snkrs_url);
            return [url, new_product_info_list];

        }catch(err){
            log.error(common.get_log_str('new_released_product_watchdog.js', 'get_product_list_from_url', err));
            return [url, []];
        }
    }

    stop_watch(){
        this.stopped = true;
    }

    open_new_released_page_test(setting){
        const fs = require('fs');
        if(setting){
            return {
                data : fs.readFileSync('./sample_data/new-releases-before.html', { encoding: 'utf8' })
            }
        }else{
            return {
                data : fs.readFileSync('./sample_data/new-releases-after.html', { encoding: 'utf8' })
            }
        }
    }
}

module.exports.NewReleasedProductWatchdog = NewReleasedProductWatchdog;