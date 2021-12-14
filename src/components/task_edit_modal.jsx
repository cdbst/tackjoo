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
        this.setLoadingStatus = this.setLoadingStatus.bind(this);

        this.product_info_list = Index.g_product_mngr.getProductInfoList();
        this.selected_product_size = undefined;

        this.state = {
            filtered_product_info_list : this.product_info_list,
            selected_product : undefined,
            account_info_list : [],
            proxy_info_list : []
        };

        this.ref_options_size = React.createRef();
        this.ref_options_type = React.createRef();
        this.ref_options_product = React.createRef();
        this.ref_options_account = React.createRef();
        this.ref_options_proxy = React.createRef();
        
        this.ref_ok_btn = React.createRef();
        this.ref_loading_div = React.createRef();
        this.ref_product_img = React.createRef();

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

        window.electron.getAccountInfo( (err, __account_info_list) => {

            this.product_info_list = Index.g_product_mngr.getProductInfoList();
            let account_info_list = undefined;

            if(err){
                account_info_list = [];
            }else{
                account_info_list = __account_info_list.accounts;
            }

            window.electron.loadProxyInfo((err, proxy_info_list) =>{

                if(err) proxy_info_list = [];

                this.setState({filtered_product_info_list : this.product_info_list, account_info_list : account_info_list, proxy_info_list : proxy_info_list}, () => {
                    this.onChangeType(
                        this.ref_options_type.current.getSelectedOptionValue(),
                        this.ref_options_product.current.getSelectedOptionKey()
                    );
                });
            });
        });
    }

    setLoadingStatus(on = true){
        this.ref_ok_btn.current.disabled = on;
        this.ref_options_type.current.setDisable(on);
        this.ref_options_product.current.setDisable(on);
        this.ref_loading_div.current.style.setProperty('display', on ? 'flex' : 'none', 'important');
        this.ref_product_img.current.style.setProperty('display', on ? 'none' : '', 'important');
    }

    onModalClosed(e){
    }

    onChangeProduct(selected_key, __callback = undefined){

        let selected_product = this.product_info_list.find((product) => { return product._id == selected_key });

        if(selected_product == undefined){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot found product info.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        this.setLoadingStatus(true);

        Index.g_product_mngr.getProductInfo(selected_product._id, (err, product_info) =>{

            this.setLoadingStatus(false);

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

    onChangeType(type_name, product_id = undefined){
        
        let _filtered_product_info_list = this.product_info_list.filter((product) =>{
            return product.sell_type == type_name;
        });

        if(_filtered_product_info_list.length == 0){
            Index.g_sys_msg_q.enqueue('Error', type_name + " has no product information.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        let selected_product_id = product_id == undefined ? _filtered_product_info_list[0]._id : product_id;
        
        this.onChangeProduct(selected_product_id, (err, _product_info) =>{
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

        const selected_size = this.ref_options_size.current.getSelectedOptionValue();
        if(selected_size == undefined || selected_size == ''){
            Index.g_sys_msg_q.enqueue('Error', "Cannot create task (size is not set condition.)", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        const selected_account_id = this.ref_options_account.current.getSelectedOptionKey();
        if(selected_account_id == undefined || selected_account_id == ''){
            Index.g_sys_msg_q.enqueue('Error', "Cannot create task (account is not set condition.)", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        const selected_account_email = this.ref_options_account.current.getSelectedOptionValue();
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

        const selected_proxy_id = this.ref_options_proxy.current.getSelectedOptionKey();
        let selected_proxy_info = undefined;
        if(selected_proxy_id != ''){
            selected_proxy_info = this.state.proxy_info_list.find((proxy_info) => { return proxy_info._id == selected_proxy_id });
        }
        
        this.props.h_create_task(this.state.selected_product, selected_size, selected_account_id, selected_account_email, selected_schedule, selected_proxy_info);
        
        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.hide();
    }

    render(){

        let sell_type_list = ProductManager.getValueList(this.product_info_list, 'sell_type', false);
        let product_name_list = ProductManager.getProductDescNameList(this.state.filtered_product_info_list);
        let product_id_list = ProductManager.getValueList(this.state.filtered_product_info_list, '_id');

        let product_img_url = this.state.selected_product == undefined ? './res/img/exclamation-diamond.svg' : this.state.selected_product.img_url;
        let product_desc_name = this.state.selected_product == undefined ? '' : ProductManager.getProductDescName(this.state.selected_product);

        let size_list = ProductManager.getProductSizeList(this.state.selected_product);

        let account_email_list = this.state.account_info_list.map((account_info) => account_info.email);
        let account_id_list = this.state.account_info_list.map((account_info) => account_info.id);

        let open_time_str = this.state.selected_product == undefined ? '' : common.get_formatted_date_str(this.state.selected_product.open_time, true);
        let close_time_str = this.state.selected_product == undefined ? '' : common.get_formatted_date_str(this.state.selected_product.close_time, true);

        let product_sell_type = this.state.selected_product == undefined ? undefined : this.state.selected_product.sell_type;

        if(open_time_str != '') this.schedule_time_input_instance.setDate(open_time_str, false);

        let porxy_alias_list = this.state.proxy_info_list.map((proxy_info => proxy_info.alias));
        porxy_alias_list.unshift('');
        let porxy__id_list = this.state.proxy_info_list.map((proxy_info => proxy_info._id));
        porxy__id_list.unshift('');

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
                                    <div ref={this.ref_loading_div} className="tesk-edit-modal-loding-div d-flex align-items-center justify-content-center">
                                        <div className="spinner-border tesk-edit-modal-spinner-product" role="status"/>    
                                    </div>
                                    <img ref={this.ref_product_img} className="rounded tesk-edit-modal-product-img" src={product_img_url} alt={product_desc_name}/>
                                </div>
                            </div>
                            <div className="mb-12 row">
                                <div className="col-md-6">
                                    <Options ref={this.ref_options_type} label="Type" options={sell_type_list} h_on_change={this.onChangeType.bind(this)}/>
                                </div>
                                <div className="col-md-6">
                                    <Options ref={this.ref_options_product} label="Product" options={product_name_list} option_keys={product_id_list} h_on_change={this.onChangeProduct.bind(this)}/>
                                </div>
                            </div>
                            <hr/>
                            <div className="mb-12 row">
                                <div className="col-md-6">
                                    <Options ref={this.ref_options_size} label="Size" options={size_list}/>
                                </div>
                                <div className="col-md-6">
                                    <Options ref={this.ref_options_account} label="Account" options={account_email_list} option_keys={account_id_list}/>
                                </div>
                            </div>
                            <hr/>
                            <div style={{display : product_sell_type != common.SELL_TYPE.normal ? 'block' : 'none'}}>
                                <div className="mb-12 row" >
                                    <div className="col-md-2">
                                        <label className="task-edit-modal-option-label">Open</label>
                                    </div>
                                    <div className="col-md-4">
                                        <label>{open_time_str == '' ? 'Unknown' : open_time_str}</label>
                                    </div>
                                    <div className="col-md-2 ">
                                        <label className="task-edit-modal-option-label">Close</label> 
                                    </div>
                                    <div className="col-md-4">
                                        <label>{close_time_str == '' ? 'Unknown' : close_time_str}</label>
                                    </div>
                                </div>
                                <hr/>
                                <div className="mb-12 row">
                                    <div className="col-md-2">
                                        <label className="task-edit-modal-option-label">Schedule</label>
                                    </div>
                                    <div className="col-md-10">
                                        <input id={this.EL_ID_MODAL_INPUT_SCHDULE_TIME} className="modal-select form-control" style={{'--width' : '450px'}}/>
                                    </div>
                                </div>
                                <hr/>
                            </div>
                            <div className="mb-12 row">
                                <label className="col-sm-2 col-form-label font-weight-bold task-edit-modal-option-label">Price</label>
                                <label className="col-sm-4 col-form-label font-weight-bold task-edit-modal-option-label">
                                    {this.state.selected_product == undefined ? '' : this.state.selected_product.price}
                                </label>
                                <div className="col-md-6">
                                    <Options ref={this.ref_options_proxy} label="Proxy" options={porxy_alias_list} option_keys={porxy__id_list}/>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" ref={this.ref_ok_btn} className="btn btn-primary btn-inner-modal" onClick={this.onSubmitTaskInfo.bind(this)}>OK</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}