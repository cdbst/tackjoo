
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
        this.modifyAccount = this.modifyAccount.bind(this);
        this.loginAccount = this.loginAccount.bind(this);

        //structure(scheme) of account info :
        // {
        //     email : '',
        //     pwd : '',
        //     status : '',
        //     session_cookie : ''
        // }

        //TODO : get account info from Electron Native. and then push into accounts_info;
        let accounts_info = [];

        //TODO : Below codes are test code
        let account = this.getAccountObj('pakd123@naver.com', '12345', this.ACCOUNT_STATUS.INVALID_ACCOUNT, 'abcd');
        accounts_info.push(account);
        //TODO : Upper codes are test code

        let table_items = this.getTableItems(accounts_info);

        this.state = {
            account_table_list : table_items,
            accounts_info : accounts_info
        }
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
        
        //TODO check duplicated and then if already existed email, show alert message.
        let _dup_accounts_info = this.state.accounts_info.filter((account)=>{
            return account.email == _email;
        })

        if(_dup_accounts_info.length > 0){
            
            return;
        }
         
        //Try login and get cookie


        // 로그인 시도후 결과에 따라 status 설정

        // this.accounts_info 에 정보 추가

        let account = this.getAccountObj(_email, _pwd, this.ACCOUNT_STATUS.INVALID_ACCOUNT, 'abcd');

        let _accounts_info = JSON.parse(JSON.stringify(this.state.accounts_info));
        _accounts_info.push(account);

        // table item 갱신
        let _account_table_list = this.getTableItems(_accounts_info);
        
        this.setState(prevState => ({
            account_table_list : _account_table_list,
            accounts_info : _accounts_info
        }));
    }

    removeAccount(_email){
        console.log('om remove !! ' + _email);

        let _accounts_info = this.state.accounts_info.filter((account)=>{
            return account.email != _email;
        })

        let _account_table_list = this.getTableItems(_accounts_info);
        
        this.setState(prevState => ({
            account_table_list : _account_table_list,
            accounts_info : _accounts_info
        }));
    }

    modifyAccount(_email, _pwd){
        console.log('om modify !! ' + _email + ' ' + _pwd);
    }

    loginAccount(_email, _pwd){
        console.log('on login !!' + _email + ' ' + _pwd);
    }

    getTableItems(accounts_info){
        let remove_handler = this.removeAccount;
        let modify_handler = this.modifyAccount;
        let login_handler = this.loginAccount;

        return accounts_info.map((account) => 
            <AccountsTableItem 
                key={account.email} 
                data={account} 
                h_remove={remove_handler} 
                h_modify={modify_handler} 
                h_login={login_handler}
            />
        );
    }

    render() {

        return (
            <div className="container-fluid">
                <AccountEditModal id="add-account-modal" h_add_new_account={this.addAccount.bind(this)}/>
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
                            <th scope="col">E-Mail</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.account_table_list}
                    </tbody>
                </table>
                </div>
                <div className="row footer">
                    <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                        <button type="button" className="btn btn-primary btn-footer-inside" data-bs-toggle="modal" data-bs-target="#add-account-modal">
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