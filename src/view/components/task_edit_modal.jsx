class TaskEditModal extends React.Component {

    EL_ID_MODAL_SELECT_TYPE = 'edit-task-type-select';
    EL_ID_MODAL_SELECT_PRODUCT = 'edit-task-product-select';
    EL_ID_MODAL_INPUT_SCHDULE_TIME = "schedule-time-input"

    constructor(props) {
        super(props);
        
        this.onSubmitTaskInfo = this.onSubmitTaskInfo.bind(this);
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onModalshown = this.onModalshown.bind(this);

        this.onChangeType = this.onChangeType.bind(this);
        this.onChangeProduct = this.onChangeProduct.bind(this);
        this.getLoggedInAccountInfoList = this.getLoggedInAccountInfoList.bind(this);

        this.product_info_list = Index.g_product_mngr.getProductInfoList();
        this.selected_product_size = undefined;

        this.state = {
            filtered_product_info_list : this.product_info_list,
            selected_product : undefined,
            logged_in_account_info_list : [],
        }

        this.ref_options_size = React.createRef();
        this.ref_options_type = React.createRef();
        this.ref_options_product = React.createRef();
        this.ref_options_account = React.createRef();

        this.schedule_time_input_instance = undefined;
    }

    componentDidMount(){

        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);

        let el_schedule_time_input = document.getElementById(this.EL_ID_MODAL_INPUT_SCHDULE_TIME);
        this.schedule_time_input_instance = flatpickr(el_schedule_time_input, {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            minuteIncrement : 2,
            dateFormat: "Y-m-d H:i:S"
        });
    }

    onModalshown(e){

        this.getLoggedInAccountInfoList((_error, _logged_in_account_info_list) =>{

            this.product_info_list = Index.g_product_mngr.getProductInfoList();

            this.setState({filtered_product_info_list : this.product_info_list, logged_in_account_info_list : _logged_in_account_info_list}, () => {
                this.onChangeType(this.ref_options_type.current.getSelectedOptionValue());
            });
        });
    }

    onModalClosed(e){
    }

    getLoggedInAccountInfoList(__callback){

        window.electron.getLoggedInAccountInfoList((error, logged_in_account_info_list) =>{
            if(error){
                Index.g_sys_msg_q.enqueue('Error', 'Cannot gathering logged in account informations.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                __callback(error, undefined);
                return;
            }

            if(logged_in_account_info_list.length == 0){
                Index.g_sys_msg_q.enqueue('Warn', 'Logged in accounts are not exist.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            }

            __callback(undefined, logged_in_account_info_list);
        });
    }

    onChangeProduct(selected_key, __callback = undefined){

        let selected_product = this.product_info_list.find((product) => { return product._id == selected_key });

        if(selected_product == undefined){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot found product info.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        Index.g_product_mngr.getProductInfo(selected_product._id, (err, product_info) =>{
            if(err){
                Index.g_sys_msg_q.enqueue('Error', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                if(__callback) __callback(err, undefined);
                return;
            }

            //TODO : Normal product type임에도 불구하고 size_info_list를 취득하지 못한 경우 어떻게 처리할 것인가?
            if(product_info.size_info_list.length == 0){
                Index.g_sys_msg_q.enqueue('Warning', 'This product has no size information yet. So, Task will buy similar size that you select.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 7000);
            }

            if(__callback){
                __callback(undefined, product_info);
                return;
            } 
            
            this.setState(_ => ({
                selected_product : product_info
            }));
        });

    }

    onChangeType(value){
        
        let _filtered_product_info_list = this.product_info_list.filter((product) =>{
            return product.sell_type == value;
        });

        if(_filtered_product_info_list.length == 0){
            Index.g_sys_msg_q.enqueue('Error', value + " has no product information.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        this.onChangeProduct(_filtered_product_info_list[0]._id, (err, _product_info) =>{
            let new_state = {filtered_product_info_list : _filtered_product_info_list};
            if(_product_info){
                new_state['selected_product'] = _product_info;
            }
            this.setState(_ => (new_state));
        });
    }

    onSubmitTaskInfo(){

        if(this.state.selected_product == undefined){
            Index.g_sys_msg_q.enqueue('Error', "Cannot create task (invalid product information.)", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        let selected_size = this.ref_options_size.current.getSelectedOptionValue();
        if(selected_size == undefined || selected_size == ''){
            Index.g_sys_msg_q.enqueue('Error', "Cannot create task (size is not set condition.)", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        let selected_account_id = this.ref_options_account.current.getSelectedOptionKey();
        if(selected_account_id == undefined || selected_account_id == ''){
            Index.g_sys_msg_q.enqueue('Error', "Cannot create task (account is not set condition.)", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        let selected_account_email = this.ref_options_account.current.getSelectedOptionValue();
        if(selected_account_email == undefined || selected_account_email == ''){
            Index.g_sys_msg_q.enqueue('Error', "Cannot create task (account is not set condition.)", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        let selected_schedule = undefined;
        
        if(this.state.selected_product.sell_type != common.SELL_TYPE.normal){
            selected_schedule = this.schedule_time_input_instance.selectedDates;
            if(selected_schedule.length == 0){
                Index.g_sys_msg_q.enqueue('Error', "Cannot create task (account is not set condition.)", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }
            selected_schedule = selected_schedule[0];
        }

        this.props.h_create_task(this.state.selected_product, selected_size, selected_account_id, selected_account_email, selected_schedule);
        
        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        
        bs_obj_modal.hide();
    }

    render(){

        let sell_type_list = Index.g_product_mngr.getValueList(this.product_info_list, 'sell_type', false);
        let product_name_list = ProductManager.getProductDescNameList(this.state.filtered_product_info_list);
        let product_id_list = Index.g_product_mngr.getValueList(this.state.filtered_product_info_list, '_id');

        let product_img_url = this.state.selected_product == undefined ? './res/img/exclamation-diamond.svg' : this.state.selected_product.img_url;
        let product_desc_name = this.state.selected_product == undefined ? '' : ProductManager.getProductDescName(this.state.selected_product);

        let size_list = Index.g_product_mngr.getProductSizeList(this.state.selected_product);

        let logged_in_account_email_list = this.state.logged_in_account_info_list.map((account_info) => account_info.email);
        let logged_in_account_id_list = this.state.logged_in_account_info_list.map((account_info) => account_info._id);

        let open_time_str = this.state.selected_product == undefined ? '' : common.get_formatted_date_str(this.state.selected_product.open_time, true);
        let close_time_str = this.state.selected_product == undefined ? '' : common.get_formatted_date_str(this.state.selected_product.close_time, true);

        let product_sell_type = this.state.selected_product == undefined ? undefined : this.state.selected_product.sell_type;

        if(open_time_str != '') this.schedule_time_input_instance.setDate(open_time_str, false);

        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={this.props.id + '-label'}>{product_desc_name}</h5>
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
                                    <TaskEditModalSelectItem ref={this.ref_options_type} label="Type" options={sell_type_list} h_on_change={this.onChangeType.bind(this)}/>
                                </div>
                                <div className="col-md-6">
                                    <TaskEditModalSelectItem ref={this.ref_options_product} label="Product" options={product_name_list} option_keys={product_id_list} h_on_change={this.onChangeProduct.bind(this)}/>
                                </div>
                            </div>
                            <hr/>
                            <div className="mb-12 row">
                                <div className="col-md-6">
                                    <TaskEditModalSelectItem ref={this.ref_options_size} label="Size" options={size_list}/>
                                </div>
                                <div className="col-md-6">
                                    <TaskEditModalSelectItem ref={this.ref_options_account} label="Account" options={logged_in_account_email_list} option_keys={logged_in_account_id_list}/>
                                </div>
                            </div>
                            <hr/>
                            <div style={{display : product_sell_type != common.SELL_TYPE.normal ? 'block' : 'none'}}>
                                <div className="mb-12 row" >
                                    <div className="col-md-2">
                                        <label className="task-eidt-modal-option-label">Open</label>
                                    </div>
                                    <div className="col-md-4">
                                        <label>{open_time_str == '' ? 'Unknown' : open_time_str}</label>
                                    </div>
                                    <div className="col-md-2 ">
                                        <label className="task-eidt-modal-option-label">Close</label> 
                                    </div>
                                    <div className="col-md-4">
                                        <label>{close_time_str == '' ? 'Unknown' : close_time_str}</label>
                                    </div>
                                </div>
                                <hr/>
                                <div className="mb-12 row">
                                    <div className="col-md-2">
                                        <label className="task-eidt-modal-option-label">Schedule</label>
                                    </div>
                                    <div className="col-md-10">
                                        <input id={this.EL_ID_MODAL_INPUT_SCHDULE_TIME} className="modal-select form-control"/>
                                    </div>
                                </div>
                                <hr/>
                                <div className="mb-12 row">
                                    <div className="col-md-2">
                                        <label className="task-eidt-modal-option-label">Price</label>
                                    </div>
                                    <div className="col-md-10">
                                        <label className="task-eidt-modal-option-label">
                                            {this.state.selected_product == undefined ? '' : this.state.selected_product.price}
                                        </label>
                                    </div>
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

        this.getSelectedOptionValue = this.getSelectedOptionValue.bind(this);
        this.getSelectedOptionKey = this.getSelectedOptionKey.bind(this);


        this.ref_options = React.createRef();
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

        if(this.props.h_on_change != undefined) this.props.h_on_change(data_to_pass);
    }

    getSelectedOptionKey(){

        if(this.props.option_keys == undefined) return undefined;

        let selected_idx = this.ref_options.current.selectedIndex;
        return this.props.option_keys[selected_idx];
    }

    getSelectedOptionValue(){
        return this.ref_options.current.value;
    }

    render(){
        let option_items = this.getOptionItems(this.props.options, this.props.option_keys);

        return(
            <div className="row">
                <div className="col-md-3 text-left task-eidt-modal-option-label">
                    <label className="col-sm-2 col-form-label font-weight-bold task-eidt-modal-option-label">{this.props.label}</label>
                </div>
                <div className="col-md-9">
                    <select className="form-select modal-select" ref={this.ref_options} aria-label="Default select example" onChange={this.onChangeOption.bind(this)}>
                        {option_items}
                    </select>
                </div>
            </div>
        );
    }
}