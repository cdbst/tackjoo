class ContentsSignIn extends React.Component {

    INPUT_EMAIL_ID = 'input-signin-emial';
    INPUT_PWD_ID = 'input-signin-password';
    SIGNIN_BTN_ID = 'btn-signin';
    INPUT_REMEMBER_INFO_ID = 'input-remember-info';

    constructor(props) {
        super(props);

        this.onSubmitUserInfo = this.onSubmitUserInfo.bind(this);
        this.onKeyDownInputPwd = this.onKeyDownInputPwd.bind(this);
        this.loadLoginInfo = this.loadLoginInfo.bind(this);
        this.loadViewTerm = this.loadViewTerm.bind(this);
        this.onChangeInputRemember = this.onChangeInputRemember.bind(this);

        this.app_version = window.electron.getAppVersion();
        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
        this.loadLoginInfo();
        this.loadViewTerm();
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    loadLoginInfo(){
        window.electron.loadLoginInfo((err, login_info) =>{
            if(err) return;
            if(login_info.remember === undefined || login_info.remember === false) return;
            document.getElementById(this.INPUT_EMAIL_ID).value = login_info.email;
            document.getElementById(this.INPUT_PWD_ID).value = login_info.password;
            document.getElementById(this.INPUT_REMEMBER_INFO_ID).checked = login_info.remember;
        });
    }

    loadViewTerm(){
        window.electron.getViewTermSetting((err, setting) =>{
            if(err !== undefined || setting === false){
                this.viewTerm();
            }
        });
    }

    onSubmitUserInfo(e){
        
        e.preventDefault();

        const email = document.getElementById(this.INPUT_EMAIL_ID).value;

        if(email == undefined || email == ''){
            Index.g_sys_msg_q.enqueue('에러', '이메일을 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        if(common.is_valid_email(email) == null){
            Index.g_sys_msg_q.enqueue('에러', '유효한 이메일 주소를 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        const password = document.getElementById(this.INPUT_PWD_ID).value;

        if(password == undefined || password.value == ''){
            Index.g_sys_msg_q.enqueue('에러', '비밀번호를 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        const remember = document.getElementById(this.INPUT_REMEMBER_INFO_ID).checked;

        const el_btn_signin = document.getElementById(this.SIGNIN_BTN_ID);
        el_btn_signin.disabled = true;
        
        window.electron.loginApp(email, password, remember, (err, expired_date)=>{

            el_btn_signin.disabled = false;

            if(err){
                Index.g_sys_msg_q.enqueue('에러', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 10000);
            }else{
                const formatted_expired_date_str = common.get_formatted_date_str(expired_date, true);
                Index.g_sys_msg_q.enqueue('로그인 성공', `앱 사용 만료 시간 : ${formatted_expired_date_str}`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 10000);
                this.props.h_signed_in();
            }
        });
    }

    onClickFindPassword(){
        window.electron.openExternalWebPage('http://18.179.4.170/password');
    }

    viewTerm(){
        window.electron.readTermFileData((err, term_data) =>{
            if(err){
                Index.g_sys_msg_q.enqueue('에러', '이용약관을 불러올수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            const converter = new showdown.Converter();
            const term_data_html = converter.makeHtml(term_data);
            Index.g_prompt_modal.popModal('이용 약관', (<div className="Container" dangerouslySetInnerHTML={{__html: term_data_html}}></div>), (is_ok)=>{
                if(is_ok){
                    window.electron.updateViewTermSetting(true);
                }else{
                    window.electron.updateViewTermSetting(false, (_err) =>{
                        window.electron.exitProgram();
                    });
                }
            });
        });
    }

    onKeyDownInputPwd(e){
        if(e.keyCode == 13){
            this.onSubmitUserInfo(e);
        }
    }

    onChangeInputRemember(e){
        if(document.getElementById(this.INPUT_REMEMBER_INFO_ID).checked) return;
        window.electron.deleteLoginInfo(()=>{});
    }

    render() {
        return (
            <div>
                <CommonTitleBar />
                <div className="text-center form-signin d-flex flex-column min-vh-100 justify-content-center align-items-center">
                    <div className="col-md-12">
                        <h1 className="h3 mb-3 contents-title">TACKJOO</h1>
                        <br/>
                        <div className="form-floating">
                            <input type="email" className="form-control" id={this.INPUT_EMAIL_ID} style={{"--width" : "100%"}} placeholder="name@example.com" />
                            <label className="common-input-label" htmlFor={this.INPUT_EMAIL_ID}>이메일 주소</label>
                        </div>
                        <div className="form-floating">
                            <input type="password" className="form-control" id={this.INPUT_PWD_ID} style={{"--width" : "100%"}} placeholder="비밀번호" onKeyDown={this.onKeyDownInputPwd.bind(this)}/>
                            <label className="common-input-label" htmlFor={this.INPUT_PWD_ID}>비밀번호</label>
                        </div>
                        <br/>
                        <div className="form-switch mb-3">
                            <input id={this.INPUT_REMEMBER_INFO_ID} type="checkbox" className="form-check-input" style={{marginRight: '5px'}} onChange={this.onChangeInputRemember.bind(this)}/>
                            <label htmlFor={this.INPUT_REMEMBER_INFO_ID} className="form-check-label">로그인정보 저장하기</label>
                        </div>
                        <button className="w-100 btn btn-lg btn-primary" type="submit" id={this.SIGNIN_BTN_ID} onClick={this.onSubmitUserInfo.bind(this)}>로그인</button>
                        <div className="mt-3">
                            <a href="#" className="text-info" onClick={this.onClickFindPassword.bind(this)}>비밀번호 변경/찾기</a>
                        </div>
                        <div className="mt-3">
                            <a href="#" className="text-info" onClick={this.viewTerm.bind(this)}>이용약관 보기</a>
                        </div>
                        <div className="mt-5 text-muted">Discord 문의👉 Takc#8171</div>
                        <div className="text-muted">{`version v${this.app_version}`}</div>
                        <div className="text-muted">&copy; ShoeSTech 2021-2022</div>
                    </div>
                    <div className="row signin-footer">
                        <div className="col-md-12 bd-highlight align-items-center text-center">
                            <p className="text-center">&copy; 슈스텍(ShoeSTech) (사업자등록번호 : 160-13-01747)</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}