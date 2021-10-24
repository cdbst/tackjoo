class TaskEditModal extends React.Component {

    EL_ID_MODAL_SELECT_TYPE = 'edit-task-type-select';
    EL_ID_MODAL_SELECT_PRODUCT = 'edit-task-product-select';

    constructor(props) {
        super(props);
        
        this.onSubmitTaskInfo = this.onSubmitTaskInfo.bind(this);
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onModalshown = this.onModalshown.bind(this);

        this.onChangeType = this.onChangeType.bind(this);
        this.onChangeProduct = this.onChangeProduct.bind(this);

        this.getProductNameList = this.getProductNameList.bind(this);    
        this.getProductIDList = this.getProductIDList.bind(this);
        this.getSellTypeList = this.getSellTypeList.bind(this);
        this.getProductDescName = this.getProductDescName.bind(this);

        this.product_info_list = Index.g_product_mngr.getProductList();

        this.state = {
            filtered_product_info_list : this.product_info_list,
            selected_product : undefined
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

        this.product_info_list = Index.g_product_mngr.getProductList();

        this.setState({filtered_product_info_list : this.product_info_list}, () => {
            let sell_types = this.getSellTypeList(this.product_info_list);
            this.onChangeType(sell_types[0]);
        });
    }

    onModalClosed(e){
        // let el_pwd_inpt = document.getElementById(this.);
        // let el_email_input = document.getElementById(this.);

        // el_pwd_inpt.value = '';
        // el_email_input.value = '';
    }

    onChangeProduct(selected_key){

        //Update product image
        let selected_product = this.product_info_list.find((product) => { return product._id == selected_key });

        //TODO : Get Detail Product Info and update modal ui
        Index.g_product_mngr.getProductInfo(selected_product._id, (err, product_info) =>{
            if(err){
                Index.g_sys_msg_q.enqueue('Error', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }
            
            //TODO
            // console.log(product_info);
        });

        this.setState(_ => ({
            selected_product : selected_product
        }));
    }

    onChangeType(value){
        
        let _filtered_product_info_list = this.product_info_list.filter((product) =>{
            return product.sell_type == value;
        });

        let _product_ids = this.getProductIDList(_filtered_product_info_list);

        this.setState({filtered_product_info_list : _filtered_product_info_list}, () => {
            if(_product_ids.length > 0){
                this.onChangeProduct(_product_ids[0]);
            }
        });
    }

    getProductDescName(product_info){
        return product_info.name + ' (' + product_info.alt_name + ')';
    }

    getProductNameList(product_info_list){
        return product_info_list.map((product_info) => this.getProductDescName(product_info) );
    }

    getProductIDList(product_info_list){
        return product_info_list.map((product_info) => product_info._id);
    }

    getSellTypeList(product_info_list){
        let product_types = [];

        product_info_list.forEach((product) => {
            if(product_types.includes(product.sell_type) == false){
                product_types.push(product.sell_type);
            }
        });
        return product_types;
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

        let sell_type_list = this.getSellTypeList(this.product_info_list);
        let product_name_list = this.getProductNameList(this.state.filtered_product_info_list);
        let product_id_list = this.getProductIDList(this.state.filtered_product_info_list);

        let product_img_url = this.state.selected_product == undefined ? './res/img/exclamation-diamond.svg' : this.state.selected_product.img_url;
        let product_desc_name = this.state.selected_product == undefined ? '' : this.getProductDescName(this.state.selected_product);

        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={this.props.id + '-label'}>Edit Task</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-12 row" style={{marginBottom : 30}}>
                                <div className="text-center">
                                    <img className="rounded tesk-edit-modal-product-img" src={product_img_url} alt={product_desc_name}/>
                                </div>
                            </div>
                            <div className="mb-12 row">
                                <div className="col-md-6">
                                    <TaskEditModalSelectItem label="Type" options={sell_type_list} h_on_change={this.onChangeType.bind(this)}/>
                                </div>
                                <div className="col-md-6">
                                    <TaskEditModalSelectItem label="Product" options={product_name_list} option_keys={product_id_list} h_on_change={this.onChangeProduct.bind(this)}/>
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
        
        let data_to_pass = this.props.option_keys == undefined ? e.target.value : selected_key;
        this.props.h_on_change(data_to_pass);
    }

    render(){
        let option_items = this.getOptionItems(this.props.options, this.props.option_keys);

        return(
            <div className="row">
                <div className="col-md-3 text-left">
                    <label className="col-sm-2 col-form-label text-white font-weight-bold">{this.props.label}</label>
                </div>
                <div className="col-md-9">
                    <select className="form-select modal-select" aria-label="Default select example" onChange={this.onChangeOption.bind(this)}>
                        {option_items}
                    </select>
                </div>
            </div>
        );
    }
}