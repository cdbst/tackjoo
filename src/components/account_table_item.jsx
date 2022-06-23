


class AccountsTableItem extends React.Component {

    constructor(props) {
        
        super(props);

        this.doLogin = this.doLogin.bind(this);
        this.cleanupCart = this.cleanupCart.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.setLoginStatus = this.setLoginStatus.bind(this);
        this.setCleanupCartStatus = this.setCleanupCartStatus.bind(this);
        this.onClickLockCfg = this.onClickLockCfg.bind(this);
        this.isLocked = this.isLocked.bind(this);
        this.updateAccount = this.updateAccount.bind(this);
        this.setSessionTimer = this.setSessionTimer.bind(this);

        this.ref_login_btn = React.createRef();
        this.ref_cleanup_cart_btn = React.createRef();

        const account_info = _.clone(this.props.account_info) // initial state
        const is_locked = account_info.locked === undefined ? false :  account_info.locked;
        const state = is_locked ? common.ACCOUNT_STATE.LOCKED : common.ACCOUNT_STATE.LOGOUT;

        common.update_account_info_obj(account_info, 'state', state);

        this.state = {
            account_info : account_info,
            session_expired_time_str : '',
        };

        this.session_timer = undefined;
    }

    isLocked(){
        return this.state.account_info.locked === undefined ? false : this.state.account_info.locked;
    }

    getAccountInfo(){
        return this.state.account_info;
    }

    componentDidMount(){

        const account_info = _.clone(this.state.account_info);

        window.electron.addAccount(account_info, this.props.save_to_file, (err) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '새로운 계정을 등록하는데 실패했습니다. ' + _email, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            //Index.g_sys_msg_q.enqueue('안내', _email + ' 새로운 계정을 등록했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);
        });
    }

    componentWillUnmount(){

        const account_info = this.state.account_info;

        window.electron.removeAccount(account_info.id, (err)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '계정 정보를 제거하는데 알 수 없는 에러가 발생했습니다. ' + account_info.email, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            }

            Index.g_sys_msg_q.enqueue('안내', account_info.email  + ' 계정 정보를 제거하였습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    setSessionTimer(expired_sec){

        if(expired_sec <= 0){
            this.setState({
                session_expired_time_str : ''
            });
            return;
        }

        if(this.session_timer !== undefined) clearInterval(this.session_timer);

        this.session_timer = setInterval(()=> {
            this.setState({
                session_expired_time_str : common.format_seconds(--expired_sec)
            }, () => {
                if(expired_sec <= 0){
                    clearInterval(this.session_timer);
                    this.session_timer = undefined;
                    common.update_account_info_obj(this.state.account_info, 'state', common.ACCOUNT_STATE.LOGOUT);
                    this.setState({ account_info : this.state.account_info });
                }
            });
        }, 1000);
    }

    doLogin(modal = true){

        if(this.isLocked()) return;

        this.setLoginStatus(true);

        window.electron.login(this.state.account_info.id, (err) =>{
            
            this.setLoginStatus(false);

            if(err){
                Index.g_sys_msg_q.enqueue('에러', `로그인에 실패했습니다. (${this.state.account_info.email})`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
                return;
            }
            
            common.update_account_info_obj(this.state.account_info, 'state', common.ACCOUNT_STATE.LOGIN);
            this.setState({ account_info : this.state.account_info });

            const session_expired_min = Index.g_settings_info.getSetting('nike_login_session_timeout');
            this.setSessionTimer(session_expired_min * 60);

            if(modal) Index.g_sys_msg_q.enqueue('안내', this.state.account_info.email + ' 로그인에 성공했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);
        });
    }

    cleanupCart(modal = true){

        if(this.isLocked()) return;

        const account_info = this.state.account_info;

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

        const new_account_info = _.clone(this.state.account_info);
        common.update_account_info_obj(new_account_info, 'locked', status);
        common.update_account_info_obj(new_account_info, 'state', status ? common.ACCOUNT_STATE.LOCKED : common.ACCOUNT_STATE.LOGOUT);

        this.updateAccount(new_account_info);
    }

    onClickRemove(){
        this.props.h_remove(this.state.account_info.id);
    }

    setLoginStatus(status){
        this.ref_login_btn.current.setLoadingStatus(status);
    }

    setCleanupCartStatus(status){
        this.ref_cleanup_cart_btn.current.setLoadingStatus(status);
    }

    updateAccount(new_account_info){

        window.electron.updateAccountInfo(this.state.account_info.id, new_account_info, (err)=>{

            if(err){
                
                Index.g_sys_msg_q.enqueue('에러', `${this.state.account_info.email} 계정 정보 업데이트에 실패했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            this.setState({
                account_info : new_account_info
            });
        });
    }

    render(){

        const is_locked = this.isLocked();

        //TODO 수정 필요.
        const status_text_class = this.state.account_info.state === common.ACCOUNT_STATE.LOGIN ? 'span-text-color-blue' : 'span-text-color-red';
        const lock_btn_title = is_locked ? '잠금 해제' : '잠금 설정';
        
        const background_color = is_locked ? 'rgb(241, 36, 36, 0.36)' : 'transparent';

        return(
            <tr style={{background : background_color}} className="draggable">
                <td style={{width : this.props.email_col_width, maxWidth : this.props.email_col_width}}>
                    <span>{this.state.account_info.email}</span>
                </td>
                <td style={{width : this.props.status_col_width, maxWidth : this.props.status_col_width}}>
                    <span className={status_text_class}>{this.state.account_info.state}</span>
                </td>
                <td style={{width : this.props.session_expired_timer_col_width, maxWidth : this.props.session_expired_timer_col_width}}>
                    <span >{this.state.session_expired_time_str}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title="로그인">
                            <LaodingButton
                                ref={this.ref_login_btn}
                                h_on_click={this.doLogin.bind(this)}
                                btn_class={"btn-info"}
                                img_src={"./res/img/door-open-fill.svg"}
                                disabled={is_locked}
                            />
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="카트 비우기">
                            <LaodingButton
                                ref={this.ref_cleanup_cart_btn}
                                h_on_click={this.cleanupCart.bind(this)}
                                btn_class={"btn-warning"}
                                img_src={"./res/img/cart-x-fill.svg"}
                                disabled={is_locked}
                            />
                        </div>
                        <div className="float-start button-wrapper-inner-table" title={lock_btn_title}>
                            <ToggleButton
                                h_on_click={this.onClickLockCfg.bind(this)}
                                init_state={is_locked}
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