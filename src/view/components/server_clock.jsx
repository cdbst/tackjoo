
class ServerClock extends React.Component {

    constructor(props) {
        super(props);

        this.__getServerDateTime = this.__getServerDateTime.bind(this);
        this.__setPowerOnClock = this.__setPowerOnClock.bind(this);
        this.__setPowerOffClock = this.__setPowerOffClock.bind(this);

        let server_time = this.__getServerDateTime();
        server_time = new Date(server_time);

        this.state = {
            server_time : server_time
        };

        this.clock_handler = undefined;
        this.__setPowerOnClock();
    }

    __setPowerOnClock() {
        this.clock_handler = setInterval(()=>{

            let new_server_time = this.state.server_time;
            new_server_time.setSeconds(new_server_time.getSeconds() + 1);
            
            this.setState(_ => ({
                server_time : new_server_time
            }));
        }, 1000);
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

    render(){
        return(
            <div>
                <span>{common.get_formatted_date_str(this.state.server_time, true)}</span>
            </div>
        )
    }
}