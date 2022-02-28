const common = require('../common/common');
const { BrowserContext } = require('./browser_context');

class NewReleasedProductWatchdog{

    /**
     * 
     * @param {number} watch_interval 몇 초 간격으로 새로운 제품을 확인할지 (초단위)
     */
    constructor(watch_interval){

        this.start_watch = this.start_watch.bind(this);
        this.stop_watch = this.stop_watch.bind(this);

        this.browser_context = new BrowserContext();
        this.cur_snapshot = undefined;
        this.watch_interval = watch_interval;
        this.watchdog_resolver = undefined;
        this.watchdog_rejecter = undefined;
        this.stopped = false;
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

            while(this.stopped === false){
                const res = await this.browser_context.open_page(common.NIKE_URL + '/kr/ko_kr/w/xg/xb/xc/new-releases');
                await common.async_sleep(this.watch_interval * 1000);
            }
        });
    }

    stop_watch(){
        this.stopped = true;
        if(this.watchdog_rejecter) this.watchdog_rejecter('watchdog is stopped');
    }
}

module.exports.NewReleasedProductWatchdog = NewReleasedProductWatchdog;