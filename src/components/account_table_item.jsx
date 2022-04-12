


class AccountsTableItem extends React.Component {

    static STATUS = {
        LOGIN : '로그인',
        LOGOUT : '로그아웃',
        LOCKED : '잠금상태'
    };

    constructor(props) {
        
        super(props);

        this.doLogin = this.doLogin.bind(this);
        this.cleanupCart = this.cleanupCart.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.setLoginStatus = this.setLoginStatus.bind(this);
        this.setCleanupCartStatus = this.setCleanupCartStatus.bind(this);
        this.onClickLockCfg = this.onClickLockCfg.bind(this);

        this.ref_login_btn = React.createRef();
        this.ref_cleanup_cart_btn = React.createRef();

        const is_locked = this.props.account_info.locked === undefined ? false : this.props.account_info.locked;

        this.state = {
            status : is_locked ? AccountsTableItem.STATUS.LOCKED : AccountsTableItem.STATUS.LOGOUT
        }
    }

    isLocked(){
        return this.state.status === AccountsTableItem.STATUS.LOCKED;
    }

    componentDidMount(){

        const account_info = this.props.account_info;

        window.electron.addAccount(account_info, this.props.save_to_file, (err) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '새로운 계정을 등록하는데 실패했습니다. ' + _email, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            //Index.g_sys_msg_q.enqueue('안내', _email + ' 새로운 계정을 등록했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);
        });
    }

    componentWillUnmount(){

        const account_info = this.props.account_info;

        window.electron.removeAccount(account_info.id, (err)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '계정 정보를 제거하는데 알 수 없는 에러가 발생했습니다. ' + account_info.email, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            }

            Index.g_sys_msg_q.enqueue('안내', account_info.email  + ' 계정 정보를 제거하였습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    doLogin(modal = true){

        this.setLoginStatus(true);

        window.electron.login(this.props.account_info.id, (err) =>{
            
            this.setLoginStatus(false);

            if(err){
                Index.g_sys_msg_q.enqueue('에러', `로그인에 실패했습니다. (${this.props.account_info.email})`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
                return;
            }
            
            this.setState({ status : AccountsTableItem.STATUS.LOGIN });

            if(modal) Index.g_sys_msg_q.enqueue('안내', this.props.account_info.email + ' 로그인에 성공했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);
        });
    }

    cleanupCart(modal = true){

        const account_info = this.props.account_info;

        this.setCleanupCartStatus(true);

        window.electron.cleanupCart(account_info.id, (err) =>{
            
            this.setCleanupCartStatus(false);

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '카트 비우기에 실패했습니다. (' + account_info.email  + ')', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            if(modal) Index.g_sys_msg_q.enqueue('안내', account_info.email + ' 카트 비우기에 성공했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    onClickLockCfg(status){
        //update lock

    }

    onClickRemove(){
        this.props.h_remove(this.props.account_info.id);
    }

    setLoginStatus(status){
        this.ref_login_btn.current.setLoadingStatus(status);
    }

    setCleanupCartStatus(status){
        this.ref_cleanup_cart_btn.current.setLoadingStatus(status);
    }

    render(){

        let status_text_class = this.state.status == AccountsTableItem.STATUS.LOGIN ? 'span-text-color-blue' : 'span-text-color-red';

        return(
            <tr>
                <td style={{width : this.props.email_col_width, maxWidth : this.props.email_col_width}}>
                    <span>{this.props.account_info.email}</span>
                </td>
                <td style={{width : this.props.status_col_width, maxWidth : this.props.status_col_width}}>
                    <span className={status_text_class}>{this.state.status}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title="로그인">
                            <LaodingButton
                                ref={this.ref_login_btn}
                                h_on_click={this.doLogin.bind(this)}
                                btn_class={"btn-info"}
                                img_src={"./res/img/door-open-fill.svg"}
                            />
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="카트 비우기">
                            <LaodingButton
                                ref={this.ref_cleanup_cart_btn}
                                h_on_click={this.cleanupCart.bind(this)}
                                btn_class={"btn-warning"}
                                img_src={"./res/img/cart-x-fill.svg"}
                            />
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <ToggleButton
                                h_on_click={this.onClickLockCfg.bind(this)}
                                init_state={false}
                                set_img_src={"./res/img/lock-fill.svg"}
                                unset_img_src={"./res/img/unlock-fill.svg"}
                                btn_class={"btn-light"}
                            />
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="제거하기">
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