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
            if(this.disable_exit == false || this.is_closed){
                this.window.webContents.debugger.detach();
                //this.window.destroy();
                return;
            } 
            
            e.preventDefault();
        });
        
        if(this.res_pkt_subscriber != undefined){
            this.attach_res_pkt_hooker();
        }
		
		//FOR TEST
        this.window.webContents.on('will-navigate', function (event, newUrl) {
            console.log(newUrl);
            // More complex code to handle tokens goes here
        })
        return true;
    }

    attach_res_pkt_hooker(){

        try {
            this.window.webContents.debugger.attach('1.3');
        } catch (err) {
            console.error('Debugger attach failed : ', err);
            return false;
        }
          
        this.window.webContents.debugger.on('detach', (event, reason) => {
            console.log('Debugger detached due to : ', reason);
        });

        var get_res_data = async (request_id) => {
            try{
                const res = await this.window.webContents.debugger.sendCommand("Fetch.getResponseBody", {requestId: request_id});
                return res.base64Encoded ? Buffer.from(res.body, 'base64').toString() : res.body;
            }catch(e){
                return undefined;
            }
        }

        this.window.webContents.debugger.on('message', async (event, method, params) => {

            if(method !== 'Fetch.requestPaused') return;

            //var req_data = params.request.postData;
            var res_data = await get_res_data(params.requestId);
            this.res_pkt_subscriber(params, res_data);
            await this.window.webContents.debugger.sendCommand("Fetch.continueRequest", {requestId: params.requestId}).catch((e)=>{});
        });

        this.window.webContents.debugger.sendCommand('Fetch.enable', { 
            patterns: [
                { requestStage: "Response" }
            ]
        });
        
        return true;
    }

    close(){
        
        if(this.is_closed) return false;
        this.__set_win_state(false);

        this.window.close();
        return true;
    }
}

module.exports.ExternalPage = ExternalPage;