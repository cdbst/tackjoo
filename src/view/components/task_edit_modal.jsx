class TaskEditModal extends React.Component {

    EL_ID_MODAL_SELECT_TYPE = 'edit-task-type-select';
    EL_ID_MODAL_SELECT_PRODUCT = 'edit-task-product-select';

    constructor(props) {
        super(props);
        
        this.onSubmitTaskInfo = this.onSubmitTaskInfo.bind(this);
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onModalshown = this.onModalshown.bind(this);

        this.onChangeType = this.onChangeType.bind(this);

        this.select_items_type = ContentsTasks.getTaskTypes();
    }

    componentDidMount(){

        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);
    }

    onModalshown(e){
        // let el_email_input = document.getElementById(this.);
        // el_email_input.focus();
    }

    onModalClosed(e){
        // let el_pwd_inpt = document.getElementById(this.);
        // let el_email_input = document.getElementById(this.);

        // el_pwd_inpt.value = '';
        // el_email_input.value = '';
    }

    onChangeType(value){
        console.log(value);
    }

    getTableItems(account_info){
        let remove_handler = this.removeAccount;
        let login_handler = this.loginAccount;

        return account_info.map((account) => 
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


    onSubmitTaskInfo(e){

        e.preventDefault();
        
        // let el_pwd_inpt = document.getElementById(this.);
        // let el_email_input = document.getElementById(this.);

        // this.props.h_add_new_account(el_email_input.value, el_pwd_inpt.value);

        // let el_modal = document.getElementById(this.props.id);
        // var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        
        bs_obj_modal.hide();
    }

    render(){
        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        {/* <div className="modal-header">
                            <h5 className="modal-title" id={this.props.id + '-label'}>Edit Task</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div> */}
                        <div className="modal-body">
                            <div className="mb-12 row">
                                <div className="col-md-6">
                                    {/* TYPE 을 먼저 선택하면 선택가능한 Product를 가져올 수 있도록 처리해아함.*/}
                                    <TaskEditModalSelectItem label="Type" options={this.select_items_type} h_on_change={this.onChangeType.bind(this)}/>
                                </div>
                                <div className="col-md-6">
                                    {/* TODO  GET product list from nike server*/}
                                    <TaskEditModalSelectItem label="Product" options={['a', 'b', 'c', 'dasdfsafsadsfsadfdsaffsa']}/>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onSubmitTaskInfo.bind(this)}>OK</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class TaskEditModalSelectItem extends React.Component {

    constructor(props) {
        super(props);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.getOptionItems = this.getOptionItems.bind(this);

    }

    getOptionItems(itmes){
        
        let idx = 0;
        return itmes.map((item) => 
            <option
                className="modal-select-option"
                key={idx++}
                value={item}
            >
            {item}
            </option>
        );
    }

    onChangeOption(e){
        this.props.h_on_change(e.target.value);
    }

    render(){
        let option_items = this.getOptionItems(this.props.options);

        return(
            <div className="row">
                <div className="col-md-4">
                    <label className="col-sm-2 col-form-label text-white font-weight-bold">{this.props.label}</label>
                </div>
                <div className="col-md-8">
                    <select className="form-select modal-select" aria-label="Default select example" onChange={this.onChangeOption.bind(this)}>
                        {option_items}
                    </select>
                </div>
            </div>
        );
    }
}