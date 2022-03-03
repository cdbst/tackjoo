const common = require('../common/common');
const { BrowserContext } = require('./browser_context');
const { parse_product_list_from_new_released_page } = require('../api/product_page_parser');
const { notify_text } = require('./notification_mngr');
const cheerio = require('cheerio');
const log = require('electron-log');
const _ = require('lodash');

class NewReleasedProductWatchdog{

    /**
     * 
     * @param {number} watch_interval 몇 초 간격으로 새로운 제품을 확인할지 (초단위)
     */
    constructor(watch_interval, watch_max_ret){

        this.start_watch = this.start_watch.bind(this);
        this.stop_watch = this.stop_watch.bind(this);
        this.get_new_released_product_info_list = this.get_new_released_product_info_list.bind(this);
        this.open_new_released_page_test = this.open_new_released_page_test.bind(this);

        this.browser_context = new BrowserContext();
        this.watch_interval = watch_interval;
        this.watch_max_ret = watch_max_ret;

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
                if(a_product_info.product_id === new_product_info.product_id){
                    already_exists = true;
                    return false;
                }
                return true;
            });

            if(already_exists){
                new_released_product_list.splice(i, 1);
            }
        }

        return new_released_product_list;
    }

    /**
     * 
     * @param {function} __callback 새로운 제품이 발견됐을때, 알림을 받기위한 callback.
     */
    start_watch(__callback){

        this.stopped = false;

        return new Promise(async (resolve, reject)=>{
            this.watchdog_resolver = resolve;
            this.watchdog_rejecter = reject;

            let prev_product_info_list = undefined;

            //let test_toggle = true;
            let ret_remain = this.watch_max_ret === 0 ? 1 : this.watch_max_ret;
            let accumulated_fail_cnt = 0;

            while(ret_remain--){

                try{
                    if(this.watch_max_ret === 0) ret_remain++;

                    if(accumulated_fail_cnt === 10){
                        notify_text('감시 기능이 중지되었습니다.', '신상품 페이지로부터 더 이상 상품 정보를 얻을수 없는 상태입니다.');
                        this.watchdog_rejecter('cannot receive product information form new release page.');
                        return;
                    }
    
                    if(this.stopped){
                        this.watchdog_rejecter('watchdog is stopped by user.');
                        return;
                    }
    
                    const res = await this.browser_context.open_page(common.NIKE_URL + '/kr/ko_kr/w/xg/xb/xc/new-releases', 1);
                    //const res = this.open_new_released_page_test(test_toggle);
                    if(res === undefined || res.data === undefined){
                        accumulated_fail_cnt++;
                        continue;
                    } 
    
                    const $ = cheerio.load(res.data);
                    const new_product_info_list = parse_product_list_from_new_released_page($);
                    if(new_product_info_list.length === 0){
                        accumulated_fail_cnt++;
                        continue;
                    }
    
                    const new_released_product_list = this.get_new_released_product_info_list(prev_product_info_list, new_product_info_list);
                    if(new_released_product_list.length > 0){
                        __callback(new_released_product_list);
                    }
    
                    prev_product_info_list = new_product_info_list;
                    accumulated_fail_cnt = 0; // 누적 에러 값을 초기화 시킨다.
                    await common.async_sleep(this.watch_interval * 1000);
                    //test_toggle = !test_toggle;
                    
                }catch(err){
                    log.error(common.get_log_str('new_released_product_watchdog.js', 'start_watch-inner-promise', err));
                    accumulated_fail_cnt++;
                }
            }

            this.watchdog_resolver();
        });
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