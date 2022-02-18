class ContentsSettings extends React.Component {

    static INPUT_ID = {
        HTTP_REQ_RET_INTERVAL : 'http-req-ret-interval-input',
        HTTP_REQ_RET_CNT : 'http-req-ret-cnt-input',
        HTTP_REQ_TIMEOUT : 'http-req-timeout-input',
        HTTP_MAX_REQ_WITHIN_SAME_IP : 'http-max-req-within-same-ip-input',
        TASK_RET_COUNT : 'task-ret-cnt-input',
        TASK_RET_INTERVAL : 'task-ret-interval-input',
        NIKE_LOGIN_SESSION_TIMEOUT : 'login-session-timeout-input',
        RESTOCK_WATCHDOG_INTERVAL : 'task-watchdog-ret-interval-input'
    }

    static OPTION_TEXT = {
        HTTP_REQ_RET_INTERVAL : 'HTTP 요청에 대한 서버의 알 수 없는 응답시, 몇 초 후 재시도 할지 설정합니다. (기본 값 : 1.5)',
        HTTP_REQ_RET_CNT : 'HTTP 요청에 대한 서버의 알 수 없는 응답시, 몇 회 재시도 할지 설정합니다. (기본 값 : 30)',
        HTTP_REQ_TIMEOUT : 'HTTP 요청에 대한 서버의 응답을 최대 몇 초 기다릴지 설정합니다. (기본 값 : 0, 계속 기다리려면 0 입력)',
        HTTP_MAX_REQ_WITHIN_SAME_IP : 'HTTP 요청시 하나의 IP에서 동시에 몇개의 요청까지 허용할지 설정합니다. (기본 값: 3, 재시작 필요)',
        TASK_RET_COUNT : '실패한 Task에 대해 몇 회 재시도 할지 설정 합니다. (기본 값: 0)',
        TASK_RET_INTERVAL : 'Task 실패시 몇 초 후 재시도 할지 설정합니다. (기본 값 : 1)',
        NIKE_LOGIN_SESSION_TIMEOUT : '나이키 로그인 세션 유지 시간을 몇 분으로 할지 설정합니다. (기본 값 : 60, 무기한 유지하려면 0 입력)',
        RESTOCK_WATCHDOG_INTERVAL : '상품 입고 확인을 몇 초 간격으로 진행할지 설정합니다. (기본 값 : 3)' 
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
    }

    getCurrentSettingsInfo(){

        let http_req_ret_cnt = this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_RET_CNT);
        http_req_ret_cnt = http_req_ret_cnt  == '' ? undefined : parseInt(http_req_ret_cnt);

        let http_req_ret_interval = this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_RET_INTERVAL);
        http_req_ret_interval = http_req_ret_interval  == '' ? undefined : parseFloat(http_req_ret_interval);

        let http_req_timeout = this.inputValue(ContentsSettings.INPUT_ID.HTTP_REQ_TIMEOUT);
        http_req_timeout = http_req_timeout  == '' ? undefined : parseFloat(http_req_timeout);

        let http_max_req_within_same_ip = this.inputValue(ContentsSettings.INPUT_ID.HTTP_MAX_REQ_WITHIN_SAME_IP);
        http_max_req_within_same_ip = http_max_req_within_same_ip  == '' ? undefined : parseInt(http_max_req_within_same_ip);

        let task_ret_cnt = this.inputValue(ContentsSettings.INPUT_ID.TASK_RET_COUNT);
        task_ret_cnt = task_ret_cnt  == '' ? undefined : parseInt(task_ret_cnt);

        let task_ret_interval = this.inputValue(ContentsSettings.INPUT_ID.TASK_RET_INTERVAL);
        task_ret_interval = task_ret_interval  == '' ? undefined : parseFloat(task_ret_interval);

        let nike_login_session_timeout = this.inputValue(ContentsSettings.INPUT_ID.NIKE_LOGIN_SESSION_TIMEOUT);
        nike_login_session_timeout = nike_login_session_timeout  == '' ? undefined : parseInt(nike_login_session_timeout);

        let restock_watchdog_interval = this.inputValue(ContentsSettings.INPUT_ID.RESTOCK_WATCHDOG_INTERVAL);
        restock_watchdog_interval = restock_watchdog_interval  == '' ? undefined : parseInt(restock_watchdog_interval);

        return {
            http_req_ret_cnt : http_req_ret_cnt,
            http_req_ret_interval : http_req_ret_interval,
            http_req_timeout : http_req_timeout,
            http_max_req_within_same_ip : http_max_req_within_same_ip,
            task_ret_cnt : task_ret_cnt,
            task_ret_interval : task_ret_interval,
            nike_login_session_timeout : nike_login_session_timeout,
            restock_watchdog_interval : restock_watchdog_interval
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
                release_note_markdown += `# ${release_note_obj.name} (${published_date_str})\r\n\r\n`;
                release_note_markdown += release_note_obj.body + '\r\n';
            });

            const converter = new showdown.Converter();
            const release_note_html = converter.makeHtml(release_note_markdown);
            console.log(release_note_html);
            Index.g_prompt_modal.popModal('에러 정보', release_note_html, ()=>{});
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
                    <div className="row">
                        <div className="col-md-8">
                            <SettingsSubTitle sub_title="<HTTP 요청 설정>" /> <br />
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_REQ_RET_CNT} desc={ContentsSettings.OPTION_TEXT.HTTP_REQ_RET_CNT} pattern={/^[0-9]\d*$/} placeholder="몇 회"/> <hr/>
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_REQ_RET_INTERVAL} desc={ContentsSettings.OPTION_TEXT.HTTP_REQ_RET_INTERVAL} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="초"/> <hr/>
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_REQ_TIMEOUT} desc={ContentsSettings.OPTION_TEXT.HTTP_REQ_TIMEOUT} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="초"/> <hr />
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.HTTP_MAX_REQ_WITHIN_SAME_IP} desc={ContentsSettings.OPTION_TEXT.HTTP_MAX_REQ_WITHIN_SAME_IP} pattern={/^[0-9]\d*$/} placeholder="몇 개"/> <hr/> <br />
                            <SettingsSubTitle sub_title="<Task 설정>" /> <br />
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.TASK_RET_COUNT} desc={ContentsSettings.OPTION_TEXT.TASK_RET_COUNT} pattern={/^[0-9]\d*$/} placeholder="몇 회"/> <hr/>
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.TASK_RET_INTERVAL} desc={ContentsSettings.OPTION_TEXT.TASK_RET_INTERVAL} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="몇 초"/> <hr/>
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.NIKE_LOGIN_SESSION_TIMEOUT} desc={ContentsSettings.OPTION_TEXT.NIKE_LOGIN_SESSION_TIMEOUT} pattern={/^[0-9]\d*$/} placeholder="몇 분"/> <hr/>
                            <SettingsOptionItem id={ContentsSettings.INPUT_ID.RESTOCK_WATCHDOG_INTERVAL} desc={ContentsSettings.OPTION_TEXT.RESTOCK_WATCHDOG_INTERVAL} pattern={/^(?!0\d)\d*(\.)?(\d+)?$/} placeholder="몇 초"/> <hr/>
                        </div>
                        <div className="col-md-4">
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