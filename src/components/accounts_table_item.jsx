


class AccountsTableItem extends React.Component {

    static LOGIN_BTN_SRC = './res/img/door-open-fill.svg';
    static LOGIN_BTN_LOADING_SRC = './res/img/tail-spin.svg';

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
        if(this.__mount == false) return;
        
        this.ref_login_btn.current.disabled = status;
        const new_log_btn_src = status ? AccountsTableItem.LOGIN_BTN_LOADING_SRC : AccountsTableItem.LOGIN_BTN_SRC;
        
        this.setState(_ => ({
            login_btn_src : new_log_btn_src
        }));
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
                            <button ref={this.ref_login_btn} type="button" className="btn btn-warning" onClick={this.onClickLogin.bind(this)}>
                                <img src={this.state.login_btn_src} style={{width:24, height:24}}/>
                            </button>
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