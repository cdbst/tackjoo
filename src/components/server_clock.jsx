
class ServerClock{

    constructor() {

        this.__getServerDateTime = this.__getServerDateTime.bind(this);
        this.__setPowerOnClock = this.__setPowerOnClock.bind(this);
        this.__invoke_alam = this.__invoke_alam.bind(this);
        this.subscribeAlam = this.subscribeAlam.bind(this);
        this.unsubscribeAlam = this.unsubscribeAlam.bind(this);
        this.getServerTime = this.getServerTime.bind(this);

        this.alam_subscribers = [];

        this.__getServerDateTime((date)=>{
            this.server_time = new Date(date);
            this.__setPowerOnClock();
        });
        this.clock_handler = undefined;
    }

    __setPowerOnClock() {
        setTimeout(()=>{
            this.server_time.setSeconds(this.server_time.getSeconds() + 1);
            this.__invoke_alam(this.server_time);
            this.__setPowerOnClock();
        }, 1000);
    }
    
    __invoke_alam(date) { 

        for(var i = this.alam_subscribers.length - 1; i >= 0 ; i--){

            try{
                let subscriber = this.alam_subscribers[i];

                if(subscriber.date == undefined){
                    subscriber.invoke(date);
                    continue;
                }
    
                if(date < subscriber.date) continue;
    
                subscriber.invoke(date);
                this.alam_subscribers.splice(i, 1);
            }catch(err){
                console.err(err);
                continue;
            }
        }
    }

    __getServerDateTime(__callback){

        var xhr = new XMLHttpRequest();
        xhr.open("GET", common.NIKE_URL + '/kr/ko_kr/', true);
        xhr.onload = (e) =>{
            if(xhr.readyState === 4){
                __callback(xhr.getResponseHeader("Date"));
            }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
            Index.g_sys_msg_q.enqueue('에러', '나이키 서버시간 정보를 가져오는데 실패했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 8000);
        };
        xhr.send(null); 
    }

    /**
     * @description server timer에 알람을 등록한다.
     * 
     * @param {Date} date 언제 알람을 받을지 정해준다. (미 지정시 1초마다 invoke가 호출됨.)
     * @param {function} invoke_handler 알람을 받을 event handler
     * @param {string} subscriber_id 구독자 아이디.
     * 
     * @returns 등록 성공시 true return, 반대의 경우 false return.
     */
    subscribeAlam(date, invoke_handler, subscriber_id){

        if(date != undefined && date instanceof Date == false) return false;

        if(invoke_handler == undefined) return false;
        if(typeof invoke_handler !== 'function') return false;

        this.alam_subscribers.push({
            date : date,
            invoke : invoke_handler,
            id : subscriber_id
        });
        return true;
    }

    unsubscribeAlam(subscriber_id){

        for(var i = this.alam_subscribers.length - 1; i >= 0 ; i--){

            try{
                const subscriber = this.alam_subscribers[i];

                if(subscriber.id == subscriber_id){
                    this.alam_subscribers.splice(i, 1);
                    return true;
                }
    
            }catch(err){
                console.err(err);
                continue;
            }
        }

        return false;
    }

    getServerTime(){
        return this.server_time;
    }
}