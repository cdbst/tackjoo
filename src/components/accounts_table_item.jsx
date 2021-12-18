


class AccountsTableItem extends React.Component {

    static LOGIN_BTN_SRC = './res/img/door-open-fill.svg';

    constructor(props) {
        
        super(props);

        this.onClickLogin = this.onClickLogin.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.setLoginStatus = this.setLoginStatus.bind(this);

        this.ref_login_btn = React.createRef();
        this.state = {
            login_btn_src : AccountsTableItem.LOGIN_BTN_SRC
        };

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickLogin(){
        this.props.h_login(this.props.data.id);
    }

    onClickRemove(){
        this.props.h_remove(this.props.data.id);
    }

    setLoginStatus(status){
        this.ref_login_btn.current.setLoginStatus(status);
    }

    render(){
        let status_text_class = this.props.data.status == ContentsAccounts.ACCOUNT_STATUS.LOGIN ? 'span-text-color-blue' : 'span-text-color-red';
        return(
            <tr>
                <td style={{width : this.props.email_col_width, maxWidth : this.props.email_col_width}}>
                    <span>{this.props.data.email}</span>
                </td>
                <td style={{width : this.props.status_col_width, maxWidth : this.props.status_col_width}}>
                    <span className={status_text_class}>{this.props.data.status}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <LaodingButton
                                ref={this.ref_login_btn}
                                h_on_click={this.onClickLogin.bind(this)}
                                btn_class={"btn-warning"}
                                img_src={"./res/img/door-open-fill.svg"}
                            />
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" onClick={this.onClickRemove.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}