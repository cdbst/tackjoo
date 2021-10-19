class TaskEditModal extends React.Component {

    EL_ID_MODAL_SELECT_TYPE = 'edit-task-type-select';
    EL_ID_MODAL_SELECT_PRODUCT = 'edit-task-product-select';

    constructor(props) {
        super(props);
        
        this.onSubmitTaskInfo = this.onSubmitTaskInfo.bind(this);
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onModalshown = this.onModalshown.bind(this);

        this.onChangeType = this.onChangeType.bind(this);
        this.onChangeProductName = this.onChangeProductName.bind(this);

        this.products_list = Index.g_product_mngr.getProductList();
        this.filtered_product_list = this.products_list;

        this.selected_product_name = undefined;
        this.selected_product_type = undefined;
        this.seledted_proudct_id = undefined;

        this.state = {
            product_types : [],
            product_names : [],
            product_ids : [],
        }
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

        this.products_list = Index.g_product_mngr.getProductList();

        let product_types = [];

        this.products_list.forEach((product) => {
            if(product_types.includes(product.type_text) == false){
                product_types.push(product.type_text);
            }
        });

        if(product_types.length == 0) return;

        this.setState(_ => ({
            product_types : product_types,
        }));

        
        this.onChangeType(product_types[0])

    }

    onModalClosed(e){
        // let el_pwd_inpt = document.getElementById(this.);
        // let el_email_input = document.getElementById(this.);

        // el_pwd_inpt.value = '';
        // el_email_input.value = '';
    }

    onChangeProductName(value, selected_key){

        this.selected_product_name = value;
        this.seledted_proudct_id = selected_key;

        //TODO : Get Detail Product Info
    }

    onChangeType(value){
        
        this.filtered_product_list = this.products_list.filter((product) =>{
            return product.type_text == value;
        });

        let _product_names = this.filtered_product_list.map((filtered_product) => filtered_product.name + ' (' + filtered_product.alt_name + ')' );
        let _product_ids =  this.filtered_product_list.map((filtered_product) => filtered_product._id);

        this.selected_product_type = value;

        this.setState(_ => ({
            product_names : _product_names,
            product_ids : _product_ids,
        }));

        this.onChangeProductName(_product_names[0], _product_ids[0])
    }

    //TODO : Get Detail Product Info
    getDetailProductInfo(product_id){

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
                                    <TaskEditModalSelectItem label="Type" options={this.state.product_types} h_on_change={this.onChangeType.bind(this)}/>
                                </div>
                                <div className="col-md-6">
                                    <TaskEditModalSelectItem label="Product" options={this.state.product_names} option_keys={this.state.product_ids} h_on_change={this.onChangeProductName.bind(this)}/>
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

    getOptionItems(items, keys = undefined){
        
        let key_list = keys == undefined ? [...Array(items.length).keys()] : keys;

        let idx = 0;
        return items.map((item) => 
            <option
                className="modal-select-option"
                key={key_list[idx]}
                value={item}
                data-key={key_list[idx++]}
            >
            {item}
            </option>
        );
    }

    onChangeOption(e){
        const selected_idx = e.target.options.selectedIndex;
        const selected_key = e.target.options[selected_idx].getAttribute('data-key');
        this.props.h_on_change(e.target.value, selected_key);
    }

    render(){
        let option_items = this.getOptionItems(this.props.options, this.props.option_keys);

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