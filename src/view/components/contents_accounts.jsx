
class ContentsAccounts extends React.Component {

    ACCOUNT_STATUS = {
        LOGIN : 'login',
        LOGOUT : 'logout',
        INVALID_ACCOUNT : 'invalid'
    }

    constructor(props) {
        super(props);

        this.addNewAccount = this.addAccount.bind(this);
        this.removeAccount = this.removeAccount.bind(this);
        this.getTableItems = this.getTableItems.bind(this);
        this.getAccountObj = this.getAccountObj.bind(this);
        this.loginAccount = this.loginAccount.bind(this);
        this.showAccountEditModal = this.showAccountEditModal.bind(this);

        this.account_edit_modal_el_id = "add-account-modal";

        //structure(scheme) of account info :
        // {
        //     email : '',
        //     pwd : '',
        //     status : '',
        //     session_cookie : ''
        // }

        //TODO : get account info from Electron Native. and then push into accounts_info;
        let accounts_info = [];

        let table_items = this.getTableItems(accounts_info);

        this.state = {
            account_table_list : table_items,
            accounts_info : accounts_info
        }

        this.actions_col_width = 240;
        this.status_col_width = 120;
        this.email_col_width = 'calc( 100% - ' + (this.actions_col_width + this.status_col_width) + 'px)';
    }

    componentDidMount(){
    }

    getAccountObj(_email, _pwd, _status, _session_cookie){
        return {
            email : _email,
            pwd : _pwd,
            status : _status,
            session_cookie : _session_cookie
        };
    }

    addAccount(_email, _pwd){

        if(_email == '' || _pwd == ''){
            this.props.sys_msg_q.enqueue('Error', 'please input valid values.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 10000);
            return;
        }
        
        let _dup_accounts_info = this.state.accounts_info.filter((account)=>{
            return account.email == _email;
        })

        if(_dup_accounts_info.length > 0){
            this.props.sys_msg_q.enqueue('Warn', _email + ' is already registered.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 10000);
            return;
        }
         
        // TODO : Try login and get cookie
        // TODO : 로그인 시도후 결과에 따라 status 값 세팅.
        // TODO : this.accounts_info 에 정보 추가

        let account = this.getAccountObj(_email, _pwd, this.ACCOUNT_STATUS.INVALID_ACCOUNT, 'abcd');

        let _accounts_info = JSON.parse(JSON.stringify(this.state.accounts_info));
        _accounts_info.push(account);

        let _account_table_list = this.getTableItems(_accounts_info);
        
        this.setState(prevState => ({
            account_table_list : _account_table_list,
            accounts_info : _accounts_info
        }));

        this.props.sys_msg_q.enqueue('Add account', _email + ' has been added.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 10000);
    }

    removeAccount(_email){
        
        //TODO user account 관련 리소스 정리 필요.

        let _accounts_info_to_remove = this.state.accounts_info.filter((account)=>{
            return account.email != _email;
        })

        let _account_table_list = this.getTableItems(_accounts_info_to_remove);
        
        this.setState(prevState => ({
            account_table_list : _account_table_list,
            accounts_info : _accounts_info_to_remove
        }));

        this.props.sys_msg_q.enqueue('Delete ccount', _email + ' has been removed.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 10000);
    }

    showAccountEditModal(_email, _pwd){

        let el_pwd_inpt = document.getElementById(this.EL_ID_MODAL_INPUT_PWD);
        let el_email_input = document.getElementById(this.EL_ID_MODAL_INPUT_EMAIL);

        //Idd Item Needed;
        el_email_input.value = _email;
        el_pwd_inpt.value = _pwd

        let el_modal = document.getElementById(this.account_edit_modal_el_id);
        var bs_obj_modal = bootstrap.Modal.getInstance(el_modal);
        bs_obj_modal.show();
    }

    loginAccount(_email, _pwd){
        console.log('on login !!' + _email + ' ' + _pwd);
    }

    getTableItems(accounts_info){
        let remove_handler = this.removeAccount;
        let login_handler = this.loginAccount;

        return accounts_info.map((account) => 
            <AccountsTableItem 
                key={account.email} 
                data={account} 
                h_remove={remove_handler} 
                h_login={login_handler}
                e_mail_col_width={this.email_col_width}
                status_col_width={this.status_col_width}
                actions_col_width={this.actions_col_width}
            />
        );
    }

    render() {
        return (
            <div className="container-fluid">
                <AccountEditModal id={this.account_edit_modal_el_id} h_add_new_account={this.addAccount.bind(this)}/>
                <br/>
                <div className="row">
                    <div className="col">
                        <h3 className="contents-title">TEST : Accounts (4/10)</h3>
                    </div>
                    <div className="col">
                        <a>TEST : search item interface</a>
                    </div>
                </div>
                <div className="table-wrapper">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col" style={{width : this.email_col_width}}>E-Mail</th>
                            <th scope="col" style={{width : this.status_col_width}}>Status</th>
                            <th scope="col" style={{width : this.actions_col_width}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.account_table_list}
                    </tbody>
                </table>
                </div>
                <div className="row footer">
                    <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                        <button type="button" className="btn btn-primary btn-footer-inside" data-bs-toggle="modal" data-bs-target={'#' + this.account_edit_modal_el_id}>
                            <img src="./res/file-plus-fill.svg" style={{width:24, height:24}}/> New Account
                        </button>
                        <button type="button" className="btn btn-warning btn-footer-inside">
                            <img src="./res/door-open-fill.svg" style={{width:24, height:24}}/> Login All
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}