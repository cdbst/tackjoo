class ContentsSignIn extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="text-center form-signin d-flex flex-column min-vh-100 justify-content-center align-items-center">
                <div className="col-md-12">
                    {/* <img className="mb-4" src="../assets/brand/bootstrap-logo.svg" alt="" width="72" height="57"> */}
                    <h1 className="h3 mb-3 contents-title">SNKRS BOT KR</h1>
                    <br/>
                    <div className="form-floating">
                        <input type="email" className="form-control" id="floatingInput" style={{"--width" : "100%"}} placeholder="name@example.com"/>
                        <label className="sigin-in-user-info-label" htmlFor="floatingInput">이메일 주소</label>
                    </div>
                    <div className="form-floating">
                        <input type="password" className="form-control" id="floatingPassword" style={{"--width" : "100%"}} placeholder="Password"/>
                        <label className="sigin-in-user-info-label" htmlFor="floatingPassword">비밀번호</label>
                    </div>
                    <div className="checkbox mb-3">
                        <label>로그인정보 저장하기 
                            <input type="checkbox" value="remember-me"/> 
                        </label>
                    </div>
                    <button className="w-100 btn btn-lg btn-primary" type="submit">로그인</button>
                    <p className="mt-5 mb-3 text-muted">&copy; cdbst 2021-2022</p>
                </div>
            </div>
        );
    }
}