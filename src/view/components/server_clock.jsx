
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
            this.__invoke_alam(this.server_time)
        }, 1000);
    }

    __invoke_alam(date) {

        console.log(date);
        console.log(this.alam_subscribers);

        for(var i = this.alam_subscribers.length - 1; i >= 0 ; i--){

            let subscriber = this.alam_subscribers[i];

            if(date < subscriber.date) continue;
            subscriber.invoke();
            this.alam_subscribers.splice(i, 1);
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

    subscribeAlam(date, invoke_handler){

        if(date == undefined) return false;
        if(date instanceof Date == false) return false;

        if(invoke_handler == undefined) return false;
        if(typeof invoke_handler !== 'function') return false;

        this.alam_subscribers.push({
            date : date,
            invoke : invoke_handler
        });
        return true;
    }
}