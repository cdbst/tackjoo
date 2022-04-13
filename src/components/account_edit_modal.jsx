class AccountEditModal extends React.Component {

    EL_ID_MODAL_INPUT_EMAIL = 'add-new-account-email-input';
    EL_ID_MODAL_INPUT_PWD = 'add-new-account-pwd-input';

    constructor(props) {
        super(props);

        this.accounts = undefined;
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onSubmitAccountInfo = this.onSubmitAccountInfo.bind(this);
        this.onModalshown = this.onModalshown.bind(this);
    }

    componentDidMount(){
        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);
    }

    onModalshown(e){
        let el_email_input = document.getElementById(this.EL_ID_MODAL_INPUT_EMAIL);
        el_email_input.focus();
    }

    onModalClosed(e){
        let el_pwd_inpt = document.getElementById(this.EL_ID_MODAL_INPUT_PWD);
        let el_email_input = document.getElementById(this.EL_ID_MODAL_INPUT_EMAIL);

        el_pwd_inpt.value = '';
        el_email_input.value = '';
    }

    onSubmitAccountInfo(e){

        e.preventDefault();
        
        let el_pwd_inpt = document.getElementById(this.EL_ID_MODAL_INPUT_PWD);
        let el_email_input = document.getElementById(this.EL_ID_MODAL_INPUT_EMAIL);

        const account_info_obj = common.get_account_info_obj_scheme();
        common.update_account_info_obj(account_info_obj, 'email', el_email_input.value);
        common.update_account_info_obj(account_info_obj, 'pwd', el_pwd_inpt.value);
        common.update_account_info_obj(account_info_obj, 'id', common.uuidv4());
        common.update_account_info_obj(account_info_obj, 'locked', false);
        common.update_account_info_obj(account_info_obj, 'state', common.ACCOUNT_STATE.LOGOUT);

        this.props.h_add_new_account(account_info_obj);

        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        
        bs_obj_modal.hide();
    }

    render(){
        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={this.props.id + '-label'}>계정 추가하기</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3 row">
                                <form onSubmit={(e)=>{e.preventDefault();}}> 
                                    <label htmlFor={this.EL_ID_MODAL_INPUT_EMAIL} className="col-sm-2 col-form-label font-weight-bold">이메일</label>
                                    <div className="col-sm-10">
                                        <input type="text" className="form-control" id={this.EL_ID_MODAL_INPUT_EMAIL} style={{'--width' : '450px'}}/>
                                    </div>
                                </form>
                            </div>
                            <div className="mb-3 row">
                                <form onSubmit={this.onSubmitAccountInfo.bind(this)}> 
                                    <label htmlFor={this.EL_ID_MODAL_INPUT_PWD} className="col-sm-2 col-form-label font-weight-bold" >비밀번호</label>
                                    <div className="col-sm-10">
                                        <input type="password" name="password" autoComplete="on" className="form-control" id={this.EL_ID_MODAL_INPUT_PWD} style={{'--width' : '450px'}}/>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">취소</button>
                            <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onSubmitAccountInfo.bind(this)}>생성</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}