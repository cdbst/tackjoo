class ContentsSettings extends React.Component {

    static INPUT_ID = {
        HTTP_REQ_RET_INTERVAL : 'http-req-ret-interval-input',
        HTTP_REQ_RET_CNT : 'http-req-ret-cnt-input',
        HTTP_REQ_TIMEOUT : 'http-req-timeout-input',
        HTTP_MAX_REQ_WITHIN_SAME_IP : 'http-max-req-within-same-ip-input',
        TASK_RET_COUNT : 'task-ret-cnt-input',
        TASK_RET_INTERVAL : 'task-ret-interval-input',
        NIKE_LOGIN_SESSION_TIMEOUT : 'login-session-timeout-input',
        RESTOCK_WATCHDOG_INTERVAL : 'task-watchdog-ret-interval-input',
        /** 신상품 관련 설정 */
        NEW_PRODUCT_WATCH_INTERVAL : 'new-product-watch-interval-input',
        NEW_PRODUCT_WATCH_MAX_RET : 'new-product-watch-max-ret-input',
        NEW_PRODUCT_CREATE_TASK_USE_PROXY : 'new-product-create-task-use-proxy-input',
        NEW_PRODUCT_QUICK_TASK_JUDGE_SIZE : 'new-product-quick-task-judge-size-input',
        NEW_PRODUCT_QUICK_TASK_USE_SNKRS_URL : 'new-product-quick-task-use-snkrs-url-input',
        NEW_PRODUCT_QUICK_TASK_USE_AUTO_TASK : 'new-product-quick-task-use-auto-task-input',
    }

    static OPTION_TEXT = {
        HTTP_REQ_RET_INTERVAL : 'HTTP 요청에 대한 서버의 알 수 없는 응답시, 몇 초 후 재시도 할지 설정합니다. (기본 값 : 1.5)',
        HTTP_REQ_RET_CNT : 'HTTP 요청에 대한 서버의 알 수 없는 응답시, 몇 회 재시도 할지 설정합니다. (기본 값 : 30)',
        HTTP_REQ_TIMEOUT : 'HTTP 요청에 대한 서버의 응답을 최대 몇 초 기다릴지 설정합니다. (기본 값 : 0, 계속 기다리려면 0 입력)',
        HTTP_MAX_REQ_WITHIN_SAME_IP : '한 개의 IP에서 동시에 몇개의 작업을 허용할지 설정합니다. (기본 값: 3, 재시작 필요)',
        TASK_RET_COUNT : '실패한 Task에 대해 몇 회 재시도 할지 설정 합니다. (기본 값: 0)',
        TASK_RET_INTERVAL : 'Task 실패시 몇 초 후 재시도 할지 설정합니다. (기본 값 : 1)',
        NIKE_LOGIN_SESSION_TIMEOUT : '공식홈페이지 로그인 세션 유지 시간을 몇 분으로 할지 설정합니다. (기본 값 : 60, 무기한 유지하려면 0 입력)',
        RESTOCK_WATCHDOG_INTERVAL : '상품 입고 확인을 몇 초 간격으로 진행할지 설정합니다. (기본 값 : 3)',
        /** 신상품 관련 설정 */
        NEW_PRODUCT_WATCH_INTERVAL : '신상품을 감시하는 주기를 몇초 간격으로 할지 지정합니다. (기본 값: 1)',
        NEW_PRODUCT_WATCH_MAX_RET : '신상품을 감시를 최대 몇 회 진행할지 지정합니다. (기본 값: 0, 무기한 감시하려면 0 입력)',
        NEW_PRODUCT_CREATE_TASK_USE_PROXY : '신상품을 구매하기 위한 작업 생성시 프록시를 활용할지 설정합니다. (기본 값: 0, [0: 미사용] [1: 사용])',
        NEW_PRODUCT_QUICK_TASK_JUDGE_SIZE : '신상품을 구매할 때, 제품의 구매 옵션을 무작위로 할지, 중간 옵션을 우선으로 할지 지정합니다. (기본 값: 0, [0: 중간] [1: 무작위])',
        NEW_PRODUCT_QUICK_TASK_USE_SNKRS_URL : '신상품을 구매할 때 launch url을 기반으로 작업을 생성할지 지정합니다. (기본 값: 0, [0: 미사용] [1: 사용])',
        NEW_PRODUCT_QUICK_TASK_USE_AUTO_TASK : '신상품 감지시 화이트리스트에 포함된 상품이라면 즉시 구매하는 기능을 사용할지 설정합니다. (기본 값: 0, [0: 미사용] [1: 사용])',
    }

    constructor(props) {
        super(props);

        this.registerOnHideTabEvent = this.registerOnHideTabEvent.bind(this);
        this.onClickSaveBtn = this.onClickSaveBtn.bind(this);
        this.inputValue = this.inputValue.bind(this);
        this.loadAppSettings = this.loadAppSettings.bind(this);
        this.getCurrentSettingsInfo = this.getCurrentSettingsInfo.bind(this);
        this.setCurrentSettingsInfo = this.setCurrentSettingsInfo.bind(this);
        this.onClickOpenLogDirectory = this.onClickOpenLogDirectory.bind(this);
        this.onClickOpenPatchNote = this.onClickOpenPatchNote.bind(this);

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
        this.registerOnHideTabEvent();
        this.loadAppSettings();
    }

    loadAppSettings(){
        Index.g_settings_info.loadAppSettings((error, settings_info) =>{
            if(error){
                Index.g_sys_msg_q.enqueue('경고', '앱 설정 정보가 아직 없거나 읽을수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
                this.setCurrentSettingsInfo(Index.g_settings_info.settings_info);
            }else{
                this.setCurrentSettingsInfo(settings_info);
            }
        });
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    inputValue(id, value){
        let el_input = document.getElementById(id);
        if(value == undefined) return el_input.value;
        el_input.value = value;
    }

    registerOnHideTabEvent(){

        let tab_menu_settings = document.querySelector('#' + MenuBar.MENU_ID.SETTINGS);
        tab_menu_settings.addEventListener('hide.bs.tab', (event) => {

            const cur_settings_info = this.getCurrentSettingsInfo();

            if(Index.g_settings_info.compareSettingsInfo(cur_settings_info)) return;
            
            event.preventDefault();

            Index.g_prompt_modal.popModal('경고', <p>이동시 변경 내용이 모두 사라집니다. 이동하시겠습니까?</p>, (is_ok)=>{

                if(is_ok == false) return;

                const origin_settings_info = Index.g_settings_info.settings_info;
                this.setCurrentSettingsInfo(origin_settings_info);

                let tab_menu_to_show = document.querySelector('#' + event.relatedTarget.id);
                let el_bs_tab_menu_to_show = bootstrap.Tab.getOrCreateInstance(tab_menu_to_show);
                el_bs_tab_menu_to_show.show();
            });
        });
    }

    setCurrentSettingsInfo(settings_info){

        let http_req_ret_cnt = settings_info.http_req_ret_cnt == undefined ? '' : settings_info.http_req_ret_cnt;
        this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_RET_CNT, http_req_ret_cnt);

        let http_req_ret_interval = settings_info.http_req_ret_interval == undefined ? '' : settings_info.http_req_ret_interval;
        this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_RET_INTERVAL, http_req_ret_interval);

        let http_req_timeout = settings_info.http_req_timeout == undefined ? '' : settings_info.http_req_timeout;
        this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_TIMEOUT, http_req_timeout);

        let http_max_req_within_same_ip = settings_info.http_max_req_within_same_ip == undefined ? '' : settings_info.http_max_req_within_same_ip;
        this.inputValue(ContentsSettings.INPUT_ID.HTTP_MAX_REQ_WITHIN_SAME_IP, http_max_req_within_same_ip);

        let task_ret_cnt = settings_info.task_ret_cnt == undefined ? '' : settings_info.task_ret_cnt;
        this.inputValue(ContentsSettings.INPUT_ID.TASK_RET_COUNT, task_ret_cnt);

        let task_ret_interval = settings_info.task_ret_interval == undefined ? '' : settings_info.task_ret_interval;
        this.inputValue(ContentsSettings.INPUT_ID.TASK_RET_INTERVAL, task_ret_interval);

        let nike_login_session_timeout = settings_info.nike_login_session_timeout == undefined ? '' : settings_info.nike_login_session_timeout;
        this.inputValue(ContentsSettings.INPUT_ID.NIKE_LOGIN_SESSION_TIMEOUT, nike_login_session_timeout);

        let restock_watchdog_interval = settings_info.restock_watchdog_interval == undefined ? '' : settings_info.restock_watchdog_interval;
        this.inputValue(ContentsSettings.INPUT_ID.RESTOCK_WATCHDOG_INTERVAL, restock_watchdog_interval);

        let new_product_watch_interval = settings_info.new_product_watch_interval == undefined ? '' : settings_info.new_product_watch_interval;
        this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_WATCH_INTERVAL, new_product_watch_interval);

        let new_product_watch_max_ret = settings_info.new_product_watch_max_ret == undefined ? '' : settings_info.new_product_watch_max_ret;
        this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_WATCH_MAX_RET, new_product_watch_max_ret);

        let new_product_create_task_use_proxy = settings_info.new_product_create_task_use_proxy == undefined ? '' : settings_info.new_product_create_task_use_proxy;
        this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_CREATE_TASK_USE_PROXY, new_product_create_task_use_proxy);

        let new_product_quick_task_judge_size = settings_info.new_product_quick_task_judge_size == undefined ? '' : settings_info.new_product_quick_task_judge_size;
        this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_JUDGE_SIZE, new_product_quick_task_judge_size);

        let new_product_quick_task_use_snkrs_url = settings_info.new_product_quick_task_use_snkrs_url == undefined ? '' : settings_info.new_product_quick_task_use_snkrs_url;
        this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_USE_SNKRS_URL, new_product_quick_task_use_snkrs_url);

        let new_product_quick_task_use_auto_task = settings_info.new_product_quick_task_use_auto_task == undefined ? '' : settings_info.new_product_quick_task_use_auto_task;
        this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_USE_AUTO_TASK, new_product_quick_task_use_auto_task);
    }

    getCurrentSettingsInfo(){

        let http_req_ret_cnt = this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_RET_CNT);
        http_req_ret_cnt = http_req_ret_cnt  == '' ? undefined : parseFloat(http_req_ret_cnt);

        let http_req_ret_interval = this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_RET_INTERVAL);
        http_req_ret_interval = http_req_ret_interval  == '' ? undefined : parseFloat(http_req_ret_interval);

        let http_req_timeout = this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_TIMEOUT);
        http_req_timeout = http_req_timeout  == '' ? undefined : parseFloat(http_req_timeout);

        let http_max_req_within_same_ip = this.inputValue(ContentsSettings.INPUT_ID.HTTP_MAX_REQ_WITHIN_SAME_IP);
        http_max_req_within_same_ip = http_max_req_within_same_ip  == '' ? undefined : parseFloat(http_max_req_within_same_ip);

        let task_ret_cnt = this.inputValue(ContentsSettings.INPUT_ID.TASK_RET_COUNT);
        task_ret_cnt = task_ret_cnt  == '' ? undefined : parseFloat(task_ret_cnt);

        let task_ret_interval = this.inputValue(ContentsSettings.INPUT_ID.TASK_RET_INTERVAL);
        task_ret_interval = task_ret_interval  == '' ? undefined : parseFloat(task_ret_interval);

        let nike_login_session_timeout = this.inputValue(ContentsSettings.INPUT_ID.NIKE_LOGIN_SESSION_TIMEOUT);
        nike_login_session_timeout = nike_login_session_timeout  == '' ? undefined : parseFloat(nike_login_session_timeout);

        let restock_watchdog_interval = this.inputValue(ContentsSettings.INPUT_ID.RESTOCK_WATCHDOG_INTERVAL);
        restock_watchdog_interval = restock_watchdog_interval  == '' ? undefined : parseFloat(restock_watchdog_interval);

        let new_product_watch_interval = this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_WATCH_INTERVAL);
        new_product_watch_interval = new_product_watch_interval  == '' ? undefined : parseFloat(new_product_watch_interval);

        let new_product_watch_max_ret = this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_WATCH_MAX_RET);
        new_product_watch_max_ret = new_product_watch_max_ret  == '' ? undefined : parseFloat(new_product_watch_max_ret);

        let new_product_create_task_use_proxy = this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_CREATE_TASK_USE_PROXY);
        new_product_create_task_use_proxy = new_product_create_task_use_proxy  == '' ? undefined : parseFloat(new_product_create_task_use_proxy);

        let new_product_quick_task_judge_size = this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_JUDGE_SIZE);
        new_product_quick_task_judge_size = new_product_quick_task_judge_size  == '' ? undefined : parseFloat(new_product_quick_task_judge_size);

        let new_product_quick_task_use_snkrs_url = this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_USE_SNKRS_URL);
        new_product_quick_task_use_snkrs_url = new_product_quick_task_use_snkrs_url  == '' ? undefined : parseFloat(new_product_quick_task_use_snkrs_url);

        let new_product_quick_task_use_auto_task = this.inputValue(ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_USE_AUTO_TASK);
        new_product_quick_task_use_auto_task = new_product_quick_task_use_auto_task  == '' ? undefined : parseFloat(new_product_quick_task_use_auto_task);

        return {
            http_req_ret_cnt : http_req_ret_cnt,
            http_req_ret_interval : http_req_ret_interval,
            http_req_timeout : http_req_timeout,
            http_max_req_within_same_ip : http_max_req_within_same_ip,
            task_ret_cnt : task_ret_cnt,
            task_ret_interval : task_ret_interval,
            nike_login_session_timeout : nike_login_session_timeout,
            restock_watchdog_interval : restock_watchdog_interval,
            new_product_watch_interval : new_product_watch_interval,
            new_product_watch_max_ret : new_product_watch_max_ret,
            new_product_create_task_use_proxy : new_product_create_task_use_proxy,
            new_product_quick_task_judge_size : new_product_quick_task_judge_size,
            new_product_quick_task_use_snkrs_url : new_product_quick_task_use_snkrs_url,
            new_product_quick_task_use_auto_task : new_product_quick_task_use_auto_task
        }
    }

    onClickSaveBtn(){

        const settings_info = this.getCurrentSettingsInfo();
        Index.g_settings_info.updateSettings(settings_info);

        Index.g_settings_info.saveAppSettings((error) =>{
            if(error) Index.g_sys_msg_q.enqueue('에러', '앱 설정 정보 저장에 실패했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            else Index.g_sys_msg_q.enqueue('안내', '앱 설정 정보 저장에 성공했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    onClickOpenLogDirectory(){
        window.electron.getAppPath((app_path) =>{
            window.electron.openDirectory(app_path + '/logs');
        });
    }

    onClickOpenPatchNote(){
        CommonUtils.fetchReleaseNote((release_note_json)=>{
            let release_note_markdown = '';

            release_note_json.forEach((release_note_obj)=>{
                const published_date_str = common.get_formatted_date_str(new Date(release_note_obj.published_at));
                release_note_markdown += `## ${release_note_obj.name} (${published_date_str})\r\n`;
                release_note_markdown += release_note_obj.body.replace(/###/g, '####') + '\r\n';
            });

            const converter = new showdown.Converter();
            const release_note_html = converter.makeHtml(release_note_markdown);
            Index.g_prompt_modal.popModal('패치 노트', (<div className="Container" dangerouslySetInnerHTML={{__html: release_note_html}}></div>), ()=>{});
        });
    }

    render(){
        return(
            <div className="tab-pane fade" id="settings" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.SETTINGS}>
                <div className="container-fluid">
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">설정</h4>
                        </div>
                    </div>
                    <br/>
                    <div className="contents-settings-contents-wrapper">
                        <div className="row">
                            <div className="col-md-10">
                                <SettingsSubTitle sub_title="<HTTP 요청 설정>" /> <br />
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_REQ_RET_CNT} desc={ContentsSettings.OPTION_TEXT.HTTP_REQ_RET_CNT} pattern={/^[0-9]\d*$/} placeholder="몇 회"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_REQ_RET_INTERVAL} desc={ContentsSettings.OPTION_TEXT.HTTP_REQ_RET_INTERVAL} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="초"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_REQ_TIMEOUT} desc={ContentsSettings.OPTION_TEXT.HTTP_REQ_TIMEOUT} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="초"/> <hr /> <br />
                                <SettingsSubTitle sub_title="<Task 설정>" /> <br />
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_MAX_REQ_WITHIN_SAME_IP} desc={ContentsSettings.OPTION_TEXT.HTTP_MAX_REQ_WITHIN_SAME_IP} pattern={/^[0-9]\d*$/} placeholder="몇 개"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.TASK_RET_COUNT} desc={ContentsSettings.OPTION_TEXT.TASK_RET_COUNT} pattern={/^[0-9]\d*$/} placeholder="몇 회"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.TASK_RET_INTERVAL} desc={ContentsSettings.OPTION_TEXT.TASK_RET_INTERVAL} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="몇 초"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.NIKE_LOGIN_SESSION_TIMEOUT} desc={ContentsSettings.OPTION_TEXT.NIKE_LOGIN_SESSION_TIMEOUT} pattern={/^[0-9]\d*$/} placeholder="몇 분"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.RESTOCK_WATCHDOG_INTERVAL} desc={ContentsSettings.OPTION_TEXT.RESTOCK_WATCHDOG_INTERVAL} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="몇 초"/> <hr/> <br />
                                <SettingsSubTitle sub_title="<신상품 관련 설정>" /> <br />
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.NEW_PRODUCT_WATCH_INTERVAL} desc={ContentsSettings.OPTION_TEXT.NEW_PRODUCT_WATCH_INTERVAL} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="몇 초"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.NEW_PRODUCT_WATCH_MAX_RET} desc={ContentsSettings.OPTION_TEXT.NEW_PRODUCT_WATCH_MAX_RET} pattern={/^[0-9]\d*$/} placeholder="몇 회"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.NEW_PRODUCT_CREATE_TASK_USE_PROXY} desc={ContentsSettings.OPTION_TEXT.NEW_PRODUCT_CREATE_TASK_USE_PROXY} pattern={/^[0-1]$/} placeholder="0 또는 1"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_JUDGE_SIZE} desc={ContentsSettings.OPTION_TEXT.NEW_PRODUCT_QUICK_TASK_JUDGE_SIZE} pattern={/^[0-1]$/} placeholder="0 또는 1"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_USE_SNKRS_URL} desc={ContentsSettings.OPTION_TEXT.NEW_PRODUCT_QUICK_TASK_USE_SNKRS_URL} pattern={/^[0-1]$/} placeholder="0 또는 1"/> <hr/>
                                <SettingsOptionItem id={ContentsSettings.INPUT_ID.NEW_PRODUCT_QUICK_TASK_USE_AUTO_TASK} desc={ContentsSettings.OPTION_TEXT.NEW_PRODUCT_QUICK_TASK_USE_AUTO_TASK} pattern={/^[0-1]$/} placeholder="0 또는 1"/> <hr/>
                            </div>
                            <div className="col-md-2">
                            </div>
                        </div>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <button type="button" className="btn btn-primary btn-footer-inside" onClick={this.onClickSaveBtn.bind(this)}>
                                <img src="./res/img/save2-fill.svg" style={{width:24, height:24}}/> 저장하기
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickOpenLogDirectory.bind(this)}>
                                <img src="./res/img/file-earmark-text-fill.svg" style={{width:24, height:24}}/> 로그폴더
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickOpenPatchNote.bind(this)}>
                                <img src="./res/img/journal-text.svg" style={{width:24, height:24}}/> 패치노트
                            </button>
                        </div>
                    </div>
                    <br/>
                </div>
            </div>
        );
    }
}

class SettingsOptionItem extends React.Component {

    constructor(props){
        super(props);
        this.onKeyUp= this.onKeyUp.bind(this);

        this.prev_value = '';
        this.__mount = false;
        
    }

    componentDidMount(){
        this.__mount = true;
        this.prev_value = document.getElementById(this.props.id).value;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onKeyUp(){

        if(this.props.pattern == undefined){
            return true;
        }
        
        let el_input = document.getElementById(this.props.id);
        const current_value = el_input.value;
        
        const result = this.props.pattern.test(current_value);
        if(current_value != '' && result == false){
            el_input.value = this.prev_value;
        }else{
            this.prev_value = current_value;
        }
    }

    render(){
        return(
            <div className="row">
                <div className="col-md-12">
                    <div className="row">
                        <label htmlFor={this.props.id} className="col-md-9 col-form-label font-weight-bold">{this.props.desc}</label>
                        <input type="text" className="form-control" id={this.props.id} placeholder={this.props.placeholder} style={{'--width' : '120px'}} onKeyUp={this.onKeyUp.bind(this)}/>
                    </div>
                </div>
            </div>
        );
    }
}

class SettingsSubTitle extends React.Component {

    constructor(props){
        super(props);

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    render(){
        return(
            <div className="row">
                <div className="col">
                    <h6 className="contents-sub-title">{this.props.sub_title}</h6>
                </div>
            </div>
        );
    }
}