
class ContentsAccounts extends React.Component {

    static ACCOUNT_STATUS = {
        LOGIN : '로그인',
        LOGOUT : '로그아웃'
    }

    constructor(props) {
        super(props);

        this.addAccount = this.addAccount.bind(this);
        this.addBulkAccount = this.addBulkAccount.bind(this);
        this.removeAccount = this.removeAccount.bind(this);
        this.getTableItems = this.getTableItems.bind(this);
        this.genAccountObj = this.genAccountObj.bind(this);
        this.loginAccount = this.loginAccount.bind(this);
        this.getAccountInfoList = this.getAccountInfoList.bind(this);
        this.onClickLoginAll = this.onClickLoginAll.bind(this);
        this.showAccountEditModal = this.showAccountEditModal.bind(this);
        this.showAccountBulkEditModal = this.showAccountBulkEditModal.bind(this);
        this.__loadAccountInfoFile = this.__loadAccountInfoFile.bind(this);
        this.__updateAccountInfo = this.__updateAccountInfo.bind(this);
        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);

        this.account_edit_modal_el_id = "edit-account-modal";
        this.account_bulk_edit_modal_el_id = "bulk-edit-account-modal";

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

        //Index.g_sys_msg_q.enqueue('로딩', '계정 정보를 읽는 중입니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

        window.electron.getAccountInfo( (err, _account_info_list) => {

            if(err) {
                Index.g_sys_msg_q.enqueue('경고', '계정정보가 아직 없거나 읽을 수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            }else{
                for(var i = 0; i < _account_info_list.accounts.length; i++){
                    let account = _account_info_list.accounts[i];
                    this.addAccount(account.email, account.pwd, account.id, false, false); // modal disable.
                }
            }
        });
    }

    getAccountInfoList(){
        return this.state.account_info;
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

    //_account_info_list 는 멀티라인 텍스트이다.
    addBulkAccount(_account_info_list){

        const account_info_list = _account_info_list.split('\n');
        const error_messages = [];
        const account_info_obj_list = [];

        for(var i = 0; i < account_info_list.length; i++){
            const account_info = account_info_list[i];

            if(account_info.trim() === '') continue; // 공백라인은 생략한다.

            const email_pwd_info_array = account_info.split(':');
            if(email_pwd_info_array.length < 2){
                error_messages.push(`[${i + 1}]번째 줄의 입력값이 올바르지 않습니다. (${account_info})`);
                continue;
            }

            const email = email_pwd_info_array.shift().trim();
            const pwd = email_pwd_info_array.join(':');

            //유효성 검사 : email이 올바른 포멧인지 확인 필요.
            if(common.is_valid_email(email) == null){
                error_messages.push(`[${i + 1}]번째 줄의 이메일 값이 올바르지 않습니다. (${account_info})`);
                continue;
            }
            if(pwd === ''){
                error_messages.push(`[${i + 1}]번째 줄의 비밀번호 값이 빈상태 입니다. (${account_info})`);
                continue;
            }

            // 중복 점검 - 현재 새로 계정 들 중에서도 중복인지 확인.
            let duplicated_account_info = account_info_obj_list.find((account_info_obj) => account_info_obj.email === email);
            if(duplicated_account_info !== undefined){
                error_messages.push(`[${i + 1}]번째 줄의 계정 정보는 이미 앞에서 입력됐습니다. (${account_info})`);
                continue;
            }

            // 중복 점검 - 기존 리스트.
            duplicated_account_info = this.state.account_info.find((account_info_obj) => account_info_obj.email === email);
            if(duplicated_account_info !== undefined){
                error_messages.push(`[${i + 1}]번째 줄의 계정 정보는 이미 등록된 계정입니다. (${account_info})`);
                continue;
            }

            const account_info_obj = this.genAccountObj(email, pwd, ContentsAccounts.ACCOUNT_STATUS.LOGOUT);
            account_info_obj_list.push(account_info_obj);            
        }
        
        if(error_messages.length > 0){
            Index.g_prompt_modal.popModal('에러 정보', CommonUtils.getTextListTag(error_messages), ()=>{this.showAccountBulkEditModal()});
            return;
        }
        
        if(account_info_obj_list.length === 0) return;

        window.electron.addAccountList(account_info_obj_list, (err)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '새로운 계정들을 등록하는데 실패했습니다. ' + _email, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            let _account_info = JSON.parse(JSON.stringify(this.state.account_info));
            _account_info = [..._account_info, ...account_info_obj_list];
            this.__updateAccountInfo(_account_info);
            
            Index.g_sys_msg_q.enqueue('알림', `총 ${account_info_obj_list.length} 개의 계정을 등록했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    addAccount(_email, _pwd, _id, save_to_file = true, modal = true){

        if(_email == '' || _pwd == ''){
            Index.g_sys_msg_q.enqueue('에러', '올바른 계정 정보를 입력하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(common.is_valid_email(_email) == null){
            Index.g_sys_msg_q.enqueue('에러', '유효한 이메일 주소를 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        let _dup_account_info = this.state.account_info.filter((account)=>{
            return account.email == _email;
        })

        if(_dup_account_info.length > 0){
            Index.g_sys_msg_q.enqueue('에러', _email + ' 해당 계정이 이미 등록된 상태입니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }
        
        let account = this.genAccountObj(_email, _pwd, ContentsAccounts.ACCOUNT_STATUS.LOGOUT, _id);

        window.electron.addAccount(account.email, account.pwd, account.id, save_to_file, (err) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '새로운 계정을 등록하는데 실패했습니다. ' + _email, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            let _account_info = JSON.parse(JSON.stringify(this.state.account_info));
            _account_info.push(account);

            this.__updateAccountInfo(_account_info);

            if(modal) Index.g_sys_msg_q.enqueue('안내', _email + ' 새로운 계정을 등록했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);
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
            Index.g_sys_msg_q.enqueue('에러', '제거할 계정 정보를 찾을 수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        window.electron.removeAccount(_id, (err)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '계정 정보를 제거하는데 알 수 없는 에러가 발생했습니다. ' + account_to_remove.email, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            }

            this.__updateAccountInfo(_updated_account_info);

            Index.g_sys_msg_q.enqueue('안내', account_to_remove.email  + ' 계정 정보를 제거하였습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
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

    showAccountBulkEditModal(){
        const el_modal = document.getElementById(this.account_bulk_edit_modal_el_id);
        var bs_obj_modal = bootstrap.Modal.getInstance(el_modal);
        bs_obj_modal.show();
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
            Index.g_sys_msg_q.enqueue('에러', '로그인할 계정정보를 찾을수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        this.table_item_ref_list[account_to_login.id].current.setLoginStatus(true);

        window.electron.login(_id, (err) =>{
            
            this.table_item_ref_list[account_to_login.id].current.setLoginStatus(false);

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '로그인에 실패했습니다. (' + account_to_login.email  + ')', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
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

            if(modal) Index.g_sys_msg_q.enqueue('안내', account_to_login.email + ' 로그인에 성공했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
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
        });

        return account_table_list;
    }

    render() {
        let num_of_accounts = this.state.account_info.length;
        let num_of_login_accounts = this.state.account_info.filter((account) => account.status == ContentsAccounts.ACCOUNT_STATUS.LOGIN).length;
        return (
            <div className="tab-pane fade" id="accounts" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.ACCOUNTS}>
                <div className="container-fluid">
                    <AccountEditModal id={this.account_edit_modal_el_id} h_add_new_account={this.addAccount.bind(this)}/>
                    <TextareaEditModal 
                        id={this.account_bulk_edit_modal_el_id} 
                        h_submit={this.addBulkAccount.bind(this)}
                        title="계정 여러개 추가하기"
                        desc="한 줄당 계정 하나 👉 testaccount@gmail.com:testpassword"
                    />
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">{"계정관리 (" + num_of_login_accounts + "/" + num_of_accounts + ")"}</h4>
                        </div>
                        <div className="col">
                            {/* <a>TEST : search item interface</a> */}
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.email_col_width, maxWidth : this.email_col_width}}>이메일</th>
                                <th scope="col" style={{width : this.status_col_width, maxWidth : this.status_col_width}}>상태</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
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
                                <img src="./res/img/file-plus-fill.svg" style={{width:24, height:24}}/> 추가하기
                            </button>
                            <button type="button" className="btn btn-primary btn-footer-inside" data-bs-toggle="modal" data-bs-target={'#' + this.account_bulk_edit_modal_el_id}>
                                <img src="./res/img/lightning-fill.svg" style={{width:24, height:24}}/> 여러개 추가
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickLoginAll.bind(this)}>
                                <img src="./res/img/door-open-fill.svg" style={{width:24, height:24}}/> 전체로그인
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}