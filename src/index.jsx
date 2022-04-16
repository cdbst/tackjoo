'use strict';

const e = React.createElement;

const SystemMessageQueue = React.createContext();

class Index extends React.Component {

    static g_sys_msg_q = new ToastMessageQueue(10000);
    static g_product_mngr = new ProductManager();
    static g_server_clock = new ServerClock();
    static g_prompt_modal = new PromptModalHandler();
    static g_time_select_modal = new TimeSelectModalHandler();
    static g_billing_info = undefined;
    static g_settings_info = new AppSettings();

    constructor(props) {
        super(props);

        this.onSignedIn = this.onSignedIn.bind(this);
        
        this.prompt_modal_ref = React.createRef();
        Index.g_prompt_modal.setModalRef(this.prompt_modal_ref);

        this.time_select_modal = React.createRef();
        Index.g_time_select_modal.setModalRef(this.time_select_modal);

        this.state = {
            sys_msg_q : Index.g_sys_msg_q,
            signed_in : false
        };
    }

    onSignedIn(){

        const cur_app_version = window.electron.getAppVersion();
        window.electron.registerchangeAppTab(CommonUtils.changeAppTab);

        CommonUtils.checkUpdate(cur_app_version, (err, result) =>{
            if(err){
                Index.g_sys_msg_q.enqueue('경고', err, ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
                return;
            }

            if(result === false){
                Index.g_sys_msg_q.enqueue('알림', `현재 버전이 최신 버전입니다. (${cur_app_version})`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
                window.electron.unsetToUpdate();
            }else{
                Index.g_prompt_modal.popModal('경고', <p>새로운 버전이 확인되었습니다. 확인 버튼을 누르면 재시작과 동시에 프로그램이 업데이트 됩니다.</p>, (is_ok)=>{
                    if(is_ok) window.electron.restartToUpdate();
                });
            }
        });

        Index.g_product_mngr.loadProductInfoList();
        this.setState(_ => ({
            signed_in : true
        }));
    }

    render() {
        return (
            <div>
                <PromptModal ref={this.prompt_modal_ref}/>
                <TimeSelectModal ref={this.time_select_modal}/>
                <Toast sys_msg_q={this.state.sys_msg_q}/>
                {this.state.signed_in ? (
                    <div>
                        <MenuBar/>
                        <MainContents />
                    </div>
                ) : (
                    <ContentsSignIn h_signed_in={this.onSignedIn.bind(this)}/>
                )}
            </div>
        );
    }
}

class CommonUtils {
    static getTextListTag(text_list){
        return (
            <ul>
                {text_list.map((text, idx) => (<li key={idx}>{text}</li>))}
            </ul>
        )
    }
    static fetchReleaseNote(__callback){
        fetch('https://api.github.com/repos/cdbst/sbkr_release/releases')
        .then((res)=>{
            return res.json();
        })
        .then((res_json)=>{
            __callback(res_json);
        })
    }
    static checkUpdate(cur_version, __callback){

        CommonUtils.fetchReleaseNote((release_info_obj)=>{

            if(release_info_obj.length === 0){
                __callback('최신 버전 정보를 확인 할 수 없습니다.(1)', undefined);
                return;
            }

            const latest_version = release_info_obj[0].name;
            if(latest_version === undefined){
                __callback('최신 버전 정보를 확인 할 수 없습니다.(2)', undefined);
                return;  
            }

            const latest_version_arr = latest_version.split('.');
            if(latest_version_arr.length !== 3){
                __callback('최신 버전 정보를 확인 할 수 없습니다.(3)', undefined);
                return;
            }

            const result = common.compare_version(cur_version, latest_version);
            __callback(undefined, result === -1);
        });
    }

    static changeAppTab(tab_el_id){
        const tab_menu_to_show = document.querySelector('#' + tab_el_id);
        const el_bs_tab_menu_to_show = bootstrap.Tab.getOrCreateInstance(tab_menu_to_show);
        el_bs_tab_menu_to_show.show();
    }
}

const domContainer = document.querySelector('#index-container');
ReactDOM.render(e(Index), domContainer);