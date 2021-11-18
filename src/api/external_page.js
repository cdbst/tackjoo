const { BrowserWindow } = require("electron");

class ExternalPage{
    
    constructor(url, browser_window_opts, res_pkt_subscriber, disable_exit = false){

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.__set_win_state = this.__set_win_state.bind(this);
        this.attach_res_pkt_hooker = this.attach_res_pkt_hooker.bind(this);

        this.url = url;
        this.browser_window_opts = browser_window_opts;
        this.res_pkt_subscriber = res_pkt_subscriber;
        this.disable_exit = disable_exit;
        this.window = undefined;
        this.is_closed = true;
        this.is_opened = false;
    }

    __set_win_state(is_open){
        this.is_closed = !is_open;
        this.is_opened = is_open;
    }

    open(){

        //TODO : add Exception handler...
        if(this.is_opened) return false;
        this.__set_win_state(true);

        this.window = new BrowserWindow(this.browser_window_opts);

        this.window.setMenuBarVisibility(false);
        this.window.loadURL(this.url);
        this.window.webContents.openDevTools(); // TO TEST

        this.window.on('close', (e) => {
            if(this.disable_exit == false) return;
            if(this.is_closed) this.window.destroy();
            e.preventDefault();
        });

        this.attach_res_pkt_hooker();
        return true;
    }

    attach_res_pkt_hooker(){

        try {
            this.window.webContents.debugger.attach('1.3');
        } catch (err) {
            console.log('Debugger attach failed : ', err);
            return false;
        }
          
        this.window.webContents.debugger.on('detach', (event, reason) => {
            console.log('Debugger detached due to : ', reason);
        });
          
        this.window.webContents.debugger.on('message', (event, method, params) => {

            if (method !== 'Network.responseReceived') return; 

            //console.log(params.response.url);

            this.window.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId }).then((response) => {
                //console.log(response);
                this.res_pkt_subscriber(response);
            }); 
        });
          
        this.window.webContents.debugger.sendCommand('Network.enable');
        return true;
    }

    close(){
        
        if(this.is_closed) return false;
        this.__set_win_state(false);

        this.window.webContents.debugger.detach();
        this.window.close();
        return true;
    }
}

module.exports.ExternalPage = ExternalPage;