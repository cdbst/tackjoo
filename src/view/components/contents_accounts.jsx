
class ContentsAccounts extends React.Component {

    static ACCOUNT_STATUS = {
        LOGIN : 'login',
        LOGOUT : 'logout'
    }

    constructor(props) {
        super(props);

        this.addAccount = this.addAccount.bind(this);
        this.removeAccount = this.removeAccount.bind(this);
        this.getTableItems = this.getTableItems.bind(this);
        this.genAccountObj = this.genAccountObj.bind(this);
        this.loginAccount = this.loginAccount.bind(this);
        this.onClickLoginAll = this.onClickLoginAll.bind(this);
        this.__loadAccountInfoFile = this.__loadAccountInfoFile.bind(this);
        this.__updateAccountInfo = this.__updateAccountInfo.bind(this);
        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);


        this.account_edit_modal_el_id = "edit-account-modal";

        let account_info = [];
        let table_items = this.getTableItems(account_info);
        this.table_item_ref_list = {};

        this.state = {
            account_info : account_info,
            account_table_list : table_items
        }
        
        this.__setupColumnsWidth();
    }

    __setupColumnsWidth(){
        this.actions_col_width = 240;
        this.status_col_width = 120;
        this.email_col_width = 'calc( 100% - ' + (this.actions_col_width + this.status_col_width) + 'px)';
    }

    componentDidMount(){
        this.__loadAccountInfoFile();
    }

    __loadAccountInfoFile(){

        Index.g_sys_msg_q.enqueue('Account information loading..', 'Please waiting for loading user information.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

        window.electron.getAccountInfo(_account_info => {

            if(_account_info.err) {
                Index.g_sys_msg_q.enqueue('Warn', 'Cannot load account information from file.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            }else{
                let file_loaded_account_info = _account_info.data.accounts;
                
                for(var i = 0; i < file_loaded_account_info.length; i++){
                    let account = file_loaded_account_info[i];
                    this.addAccount(account.email, account.pwd, false); // modal disable.
                }
            }
        });
    }

    __updateAccountInfo(_account_info){

        let _account_table_list = this.getTableItems(_account_info);
            
        this.setState(prevState => ({
            account_table_list : _account_table_list,
            account_info : _account_info
        }));
    }

    genAccountObj(_email, _pwd, _status, _id = undefined){

        return {
            email : _email,
            pwd : _pwd,
            status : _status,
            id : _id == undefined ? common.uuidv4() : _id
        };
    }

    addAccount(_email, _pwd, modal = true){

        if(_email == '' || _pwd == ''){
            Index.g_sys_msg_q.enqueue('Error', 'please input valid values.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 10000);
            return;
        }

        let _dup_account_info = this.state.account_info.filter((account)=>{
            return account.email == _email;
        })

        if(_dup_account_info.length > 0){
            Index.g_sys_msg_q.enqueue('Warn', _email + ' is already registered.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 10000);
            return;
        }
        
        let account = this.genAccountObj(_email, _pwd, ContentsAccounts.ACCOUNT_STATUS.LOGOUT);

        window.electron.addAccount(account.email, account.pwd, account.id, (err) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('Error', 'cannot save new account ' + _email + '\n' + err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 10000);
                return;
            }

            let _account_info = JSON.parse(JSON.stringify(this.state.account_info));
            _account_info.push(account);

            this.__updateAccountInfo(_account_info);

            if(modal) Index.g_sys_msg_q.enqueue('Add Account', _email + ' has been added.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    removeAccount(_id){
        
        let account_to_remove = undefined;

        let _updated_account_info = this.state.account_info.filter((account)=>{
            if(account.id != _id) return true;
            account_to_remove = account;
            return false;
        });

        if(account_to_remove == undefined){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot found account info to delete.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        window.electron.removeAccount(_id, (err)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('WARN', 'Some error was accured while removing account ' + account_to_remove.email  + '\n' + err, ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            }

            this.__updateAccountInfo(_updated_account_info);

            Index.g_sys_msg_q.enqueue('Delete Account', account_to_remove.email  + ' has been removed', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    onClickLoginAll(e){
        this.state.account_info.forEach((account)=>{
            this.loginAccount(account.id, false);
        });
    }

    loginAccount(_id, modal = true){
        
        let account_to_login = undefined;

        for(var i = 0; i < this.state.account_info.length; i++){
            let account = this.state.account_info[i];
            if(account.id != _id) continue;
            account_to_login = account;
            break;
        }

        if(account_to_login == undefined){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot found account info to login.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 10000);
            return;
        }

        if(modal) Index.g_sys_msg_q.enqueue('Try to login', 'Please wait for login is completed. (' + account_to_login.email  + ')', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);

        this.table_item_ref_list[account_to_login.id].current.setLoginStatus(true);

        window.electron.login(_id, (err) =>{
            
            this.table_item_ref_list[account_to_login.id].current.setLoginStatus(false);

            if(err){
                Index.g_sys_msg_q.enqueue('Login Fail', 'Please input validate account information (' + account_to_login.email  + ')\n' + err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 10000);
                return;
            }

            let _account_info = JSON.parse(JSON.stringify(this.state.account_info));

            for(var i = 0; i < _account_info.length; i++){
                if(_account_info[i].id != _id) continue;
                _account_info[i].status = ContentsAccounts.ACCOUNT_STATUS.LOGIN;
                break;
            }

            let _account_table_list = this.getTableItems(_account_info);
            
            this.setState(_ => ({
                account_table_list : _account_table_list,
                account_info : _account_info
            }));

            if(modal) Index.g_sys_msg_q.enqueue('Login Successful', account_to_login.email + ' login successfully', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    getTableItems(account_info){
        let remove_handler = this.removeAccount;
        let login_handler = this.loginAccount;

        let account_table_list = [];
        this.table_item_ref_list = {};

        account_info.forEach((account) =>{
            this.table_item_ref_list[account.id] = React.createRef();

            account_table_list.push(
                <AccountsTableItem 
                    ref={this.table_item_ref_list[account.id]}
                    key={account.email} 
                    data={account} 
                    h_remove={remove_handler} 
                    h_login={login_handler}
                    e_mail_col_width={this.email_col_width}
                    status_col_width={this.status_col_width}
                    actions_col_width={this.actions_col_width}
                />
            );
        })

        return account_table_list;
    }

    render() {
        let num_of_accounts = this.state.account_info.length;
        let num_of_login_accounts = this.state.account_info.filter((account) => account.status == ContentsAccounts.ACCOUNT_STATUS.LOGIN).length;
        return (
            <div className="tab-pane fade" id="accounts" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.ACCOUNTS}>
                <div className="container-fluid">
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">{"Accounts (" + num_of_login_accounts + "/" + num_of_accounts + ")"}</h4>
                        </div>
                        <div className="col">
                            {/* <a>TEST : search item interface</a> */}
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.email_col_width, maxWidth : this.email_col_width}}>E-Mail</th>
                                <th scope="col" style={{width : this.status_col_width, maxWidth : this.status_col_width}}>Status</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>Actions</th>
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
                                <img src="./res/img/file-plus-fill.svg" style={{width:24, height:24}}/> New Account
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickLoginAll.bind(this)}>
                                <img src="./res/img/door-open-fill.svg" style={{width:24, height:24}}/> Login All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}