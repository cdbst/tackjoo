
class ServerClock{

    constructor() {

        this.__getServerDateTime = this.__getServerDateTime.bind(this);
        this.__setPowerOnClock = this.__setPowerOnClock.bind(this);
        this.__setPowerOffClock = this.__setPowerOffClock.bind(this);
        this.__invoke_alam = this.__invoke_alam.bind(this);
        this.subscribeAlam = this.subscribeAlam.bind(this);

        let server_time = this.__getServerDateTime();
        this.server_time = new Date(server_time);

        this.alam_subscribers = [];

        this.clock_handler = undefined;
        this.__setPowerOnClock();
    }

    __setPowerOnClock() {
        this.clock_handler = setInterval(()=>{
            this.server_time.setSeconds(this.server_time.getSeconds() + 1);
            this.__invoke_alam(this.server_time);
        }, 1000);
    }

    __invoke_alam(date) { 
        //TODO mutex, lock이 필요한지 검토 필요.

        for(var i = this.alam_subscribers.length - 1; i >= 0 ; i--){

            let subscriber = this.alam_subscribers[i];

            if(subscriber.date == undefined){
                subscriber.invoke(date);
            }else{
                if(date < subscriber.date) continue;
                subscriber.invoke(date);
                this.alam_subscribers.splice(i, 1);
            }
        }
    }

    __setPowerOffClock() {
        if(this.clock_handler == undefined) return;
        clearInterval(this.clock_handler);
    }

    __getServerDateTime(){
        xml_http_req = new XMLHttpRequest();
        xml_http_req.open('HEAD', common.NIKE_URL + '/kr/ko_kr/', false);
        xml_http_req.setRequestHeader("Content-Type", "text/html");
        xml_http_req.send('');
        return xml_http_req.getResponseHeader("Date");
    }

    /**
     * @description server timer에 알람을 등록한다.
     * 
     * @param {Date} date 언제 알람을 받을지 정해준다. (미 지정시 1초마다 invoke가 호출됨.)
     * @param {function} invoke_handler 알람을 받을 event handler
     * @returns 등록 성공시 true return, 반대의 경우 false return.
     */
    subscribeAlam(date, invoke_handler){

        if(date != undefined && date instanceof Date == false) return false;

        if(invoke_handler == undefined) return false;
        if(typeof invoke_handler !== 'function') return false;

        this.alam_subscribers.push({
            date : date,
            invoke : invoke_handler
        });
        return true;
    }
}