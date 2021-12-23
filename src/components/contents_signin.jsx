class ContentsSignIn extends React.Component {

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
        window.electron.loginApp('test', 'a', true, (err, result)=>{
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
                        <input type="email" className="form-control" id="signin-input-emial" style={{"--width" : "100%"}} placeholder="name@example.com"/>
                        <label className="sigin-in-user-info-label" htmlFor="signin-input-emial">이메일 주소</label>
                    </div>
                    <div className="form-floating">
                        <input type="password" className="form-control" id="signin-input-password" style={{"--width" : "100%"}} placeholder="비밀번호"/>
                        <label className="sigin-in-user-info-label" htmlFor="signin-input-password">비밀번호</label>
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