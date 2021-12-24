class ContentsSignIn extends React.Component {

    SIGNIN_INPUT_EMAIL = 'signin-input-emial';
    SIGNIN_INPUT_PWD = 'signin-input-password';

    constructor(props) {
        super(props);

        this.onClickLoginBtn = this.onClickLoginBtn.bind(this);
        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickLoginBtn(){
        // 입력된 유저 정보를 읽고, 그 유효성을 파악해야함
        // 로그인 버튼을 disable 하고, 응답 완료후 enable 처리필요.
        // 로그인시 남은 사용기간이 언제까지인지 표시 필요.

        const email = document.getElementById(this.SIGNIN_INPUT_EMAIL).value;

        if(email == undefined || email == ''){
            Index.g_sys_msg_q.enqueue('에러', '이메일을 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        if(common.is_valid_email(email) == null){
            Index.g_sys_msg_q.enqueue('에러', '유효한 이메일 주소를 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        const password = document.getElementById(this.SIGNIN_INPUT_PWD).value;

        if(password == undefined || password.value == ''){
            Index.g_sys_msg_q.enqueue('에러', '비밀번호를 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }
        
        window.electron.loginApp(email, password, true, (err, result)=>{
            console.log(err);
            console.log(result);
        });
    }

    render() {
        return (
            <div className="text-center form-signin d-flex flex-column min-vh-100 justify-content-center align-items-center">
                <div className="col-md-12">
                    <h1 className="h3 mb-3 contents-title">SNKRS BOT KR</h1>
                    <br/>
                    <div className="form-floating">
                        <input type="email" className="form-control" id={this.SIGNIN_INPUT_EMAIL} style={{"--width" : "100%"}} placeholder="name@example.com"/>
                        <label className="sigin-in-user-info-label" htmlFor={this.SIGNIN_INPUT_EMAIL}>이메일 주소</label>
                    </div>
                    <div className="form-floating">
                        <input type="password" className="form-control" id={this.SIGNIN_INPUT_PWD} style={{"--width" : "100%"}} placeholder="비밀번호"/>
                        <label className="sigin-in-user-info-label" htmlFor={this.SIGNIN_INPUT_PWD}>비밀번호</label>
                    </div>
                    <br/>
                    <div className="checkbox mb-3">
                        <label>로그인정보 저장하기 
                            <input type="checkbox"/> 
                        </label>
                    </div>
                    <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={this.onClickLoginBtn.bind(this)}>로그인</button>
                    <p className="mt-5 mb-3 text-muted">&copy; cdbst 2021-2022</p>
                </div>
            </div>
        );
    }
}