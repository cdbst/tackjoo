const { BrowserWindow } = require("electron");
const common = require("../common/common.js");
const log = require('electron-log');

class ExternalPage{
    
    constructor(url, browser_window_opts, pkt_subscriber, disable_exit = false){

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.__set_win_state = this.__set_win_state.bind(this);
        this.attach_res_pkt_hooker = this.attach_res_pkt_hooker.bind(this);
        this.attach_web_contents_event_hooker = this.attach_web_contents_event_hooker.bind(this);
        this.call_renderer_api = this.call_renderer_api.bind(this);

        this.url = url;
        this.browser_window_opts = browser_window_opts;
        this.pkt_subscriber = pkt_subscriber;
        this.disable_exit = disable_exit;
        this.window = undefined;
        this.is_closed = true;
        this.is_opened = false;

        this.window_close_event_subscriber = undefined;
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
                if(this.window_close_event_subscriber)this.window_close_event_subscriber();
                return;
            }
            
            e.preventDefault();
        });
        
        if(this.pkt_subscriber != undefined){
            this.attach_res_pkt_hooker();
        }

        return true;
    }

    attach_window_close_event_hooker(__callback){
        this.window_close_event_subscriber = __callback;
    }

    attach_web_contents_event_hooker(evt_name, __callback){
        this.window.webContents.on(evt_name, function(event, new_url){
            __callback.apply(null, arguments)
        });
    }

    attach_res_pkt_hooker(){

        try{
            this.window.webContents.debugger.attach('1.3');
        }catch(err){
            log.error(common.get_log_str('external_page.js', 'attach_res_pkt_hooker', err));
            return false;
        }
          
        this.window.webContents.debugger.on('detach', (event, reason) => {
            log.verbose(common.get_log_str('external_page.js', 'attach_res_pkt_hooker', 'Debugger detached due to : ', reason));
        });

        var get_res_data = async (request_id) => {
            try{
                const res = await this.window.webContents.debugger.sendCommand("Fetch.getResponseBody", {requestId: request_id});
                const res_body = res.base64Encoded ? Buffer.from(res.body, 'base64').toString() : res.body;
                return [res, res_body];
            }catch(e){
                log.verbose(common.get_log_str('external_page.js', 'attach_res_pkt_hooker-get_res_data', e));
                return [undefined, undefined];
            }
        }

        this.window.webContents.debugger.on('message', async (event, method, params) => {

            if(method !== 'Fetch.requestPaused') return;

            //var req_data = params.request.postData;
            const [res, res_data] = await get_res_data(params.requestId);
            this.pkt_subscriber(params, params.request.url, res_data, res);
            await this.window.webContents.debugger.sendCommand("Fetch.continueRequest", {requestId: params.requestId}).catch((e)=>{});
        });

        this.window.webContents.debugger.sendCommand('Fetch.enable', { 
            patterns: [
                { requestStage: "Response" },
                // { requestStage: "Request" }
            ]
        });
        
        return true;
    }

    call_renderer_api(api, args){
        this.window.webContents.send('message', {api: api, args: args});
    }

    close(){
        
        if(this.is_closed) return false;
        this.__set_win_state(false);

        this.window.close();
        return true;
    }
}

module.exports.ExternalPage = ExternalPage;