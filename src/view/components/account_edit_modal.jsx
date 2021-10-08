class AccountEditModal extends React.Component {

    EL_ID_MODAL_INPUT_EMAIL = 'add-new-account-email-input';
    EL_ID_MODAL_INPUT_PWD = 'add-new-account-pwd-input';

    constructor(props) {
        super(props);

        this.accounts = undefined;
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onClickAddAccount = this.onClickAddAccount.bind(this);
    }

    onModalClosed(e){
        let el_pwd_inpt = document.getElementById(this.EL_ID_MODAL_INPUT_PWD);
        let el_email_input = document.getElementById(this.EL_ID_MODAL_INPUT_EMAIL);

        el_pwd_inpt.value= '';
        el_email_input.value= '';
    }

    onClickAddAccount(e){
        let el_pwd_inpt = document.getElementById(this.EL_ID_MODAL_INPUT_PWD);
        let el_email_input = document.getElementById(this.EL_ID_MODAL_INPUT_EMAIL);

        //Idd Item Needed;
        this.props.h_add_new_account(el_email_input.value, el_pwd_inpt.value);

        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getInstance(el_modal);
        bs_obj_modal.hide();
    }

    componentDidMount(){
        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);
    }

    render(){
        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={this.props.id + '-label'}>Add New Account</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3 row">
                            <label htmlFor={this.EL_ID_MODAL_INPUT_EMAIL} className="col-sm-2 col-form-label">Email</label>
                            <div className="col-sm-10">
                                <input type="text" className="form-control" id={this.EL_ID_MODAL_INPUT_EMAIL} />
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label htmlFor={this.EL_ID_MODAL_INPUT_PWD} className="col-sm-2 col-form-label">Password</label>
                            <div className="col-sm-10">
                                <input type="password" className="form-control" id={this.EL_ID_MODAL_INPUT_PWD}/>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onClickAddAccount.bind(this)}>OK</button>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}