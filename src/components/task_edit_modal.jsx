class TaskEditModal extends React.Component {

    EL_ID_MODAL_SELECT_TYPE = 'edit-task-type-select';
    EL_ID_MODAL_SELECT_PRODUCT = 'edit-task-product-select';
    EL_ID_MODAL_INPUT_SCHDULE_TIME = "schedule-time-input";
    EL_ID_MODAL_INPUT_CUSTOM_PRODUCT_NAME = 'edit-task-custom-product-name-input';
    static ACCOUNT_OPTION_NAME_ALL = '⚡모든 계정';

    constructor(props) {
        super(props);
        
        this.onSubmitTaskInfo = this.onSubmitTaskInfo.bind(this);
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onModalshown = this.onModalshown.bind(this);

        this.onChangeType = this.onChangeType.bind(this);
        this.onChangeProduct = this.onChangeProduct.bind(this);
        this.setLoadingStatus = this.setLoadingStatus.bind(this);
        this.setCustomURLProduct = this.setCustomURLProduct.bind(this);

        this.onChangeUseReservation = this.onChangeUseReservation.bind(this);
        this.onClickProductImg = this.onClickProductImg.bind(this);

        this.getKreamProductInfo = this.getKreamProductInfo.bind(this);

        this.product_info_list = Index.g_product_mngr.getProductInfoList();
        this.selected_product_size = undefined;

        this.state = {
            filtered_product_info_list : this.product_info_list,
            selected_product : undefined,
            account_info_list : [],
            proxy_info_list : [],
            use_reservation : true
        };

        this.ref_options_size = React.createRef();
        this.ref_options_type = React.createRef();
        this.ref_options_product = React.createRef();
        this.ref_options_custom_product = React.createRef();
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

        this.schedule_time_input_instance = flatpickr('#'+this.EL_ID_MODAL_INPUT_SCHDULE_TIME, {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            minuteIncrement : 1,
            dateFormat: "y.m.d H:i:S",
            locale: "ko",
            static : true
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

                let el_modal = document.getElementById(this.props.id);

                if(el_modal.product_link_url === undefined){

                    this.setState({filtered_product_info_list : this.product_info_list, account_info_list : account_info_list, proxy_info_list : proxy_info_list}, () => {
                        this.onChangeType(
                            this.ref_options_type.current.getSelectedOptionValue(),
                            this.ref_options_product.current.getSelectedOptionKey()
                        );
                    });

                }else{                    
                    this.setCustomURLProduct(el_modal.product_link_url, account_info_list, proxy_info_list);
                }
            });
        });
    }

    setCustomURLProduct(product_link_url, account_info_list, proxy_info_list){

        this.setLoadingStatus(true);

        Index.g_sys_msg_q.enqueue('알림', '제품 정보 읽어오는 중입니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);

        window.electron.getProductInfo(product_link_url, (error, product_info) =>{

            this.setLoadingStatus(false);
            
            if(product_info == undefined){
                Index.g_sys_msg_q.enqueue('경고', '제품 정보를 읽는데 실패했습니다. 아직 미출시 상태의 상품 링크이거나 올바른 링크가 아닙니다.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 4000);

                product_info = ProductManager.getCustomProductInfo(product_link_url);
            }else{
                Index.g_sys_msg_q.enqueue('알림', '제품 정보를 성공적으로 읽어왔습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);

                common.update_product_info_obj(product_info, '_id', common.uuidv4());
                common.update_product_info_obj(product_info, 'url', product_link_url);
            }

            this.product_info_list = [product_info];

            this.setState({filtered_product_info_list : this.product_info_list, account_info_list : account_info_list, proxy_info_list : proxy_info_list}, () => {
                this.setState(_ => ({
                    selected_product : product_info
                }));
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

    getKreamProductInfo(){
        if(this.state.selected_product === undefined) return;

        window.electron.getKreamProductInfo(this.state.selected_product, (err, kream_product_info)=>{
            if(err) return;
            console.log(kream_product_info);
            this.setState(_ => ({ kream_product_info : kream_product_info }));
        });
    }

    onChangeProduct(selected_key, __callback = undefined){

        let selected_product = this.product_info_list.find((product) => { return product._id == selected_key });

        if(selected_product == undefined){
            Index.g_sys_msg_q.enqueue('에러', '제품 정보를 읽는데 실패했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        this.setLoadingStatus(true);

        Index.g_product_mngr.getProductInfo(selected_product._id, (err, product_info) =>{

            this.setLoadingStatus(false);

            if(err){
                Index.g_sys_msg_q.enqueue('에러', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                if(__callback) __callback(err, undefined);
                return;
            }

            //TODO : Normal product type임에도 불구하고 size_info_list를 취득하지 못한 경우 어떻게 처리할 것인가?
            if(product_info.size_info_list.length == 0){
                Index.g_sys_msg_q.enqueue('경고', '해당 상품은 아직 사이즈 정보가 없습니다. 사이즈를 선택하면, 같거나 가장 유사한 사이즈로 구매를 진행합니다.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            }

            if(__callback){
                __callback(undefined, product_info);
                return;
            } 
            
            this.setState(_ => ({ 
                selected_product : product_info,
                kream_product_info : undefined
            }), ()=>{ this.getKreamProductInfo(); 
            });
        });
    }

    onChangeType(type_name, product_id = undefined){
        
        let _filtered_product_info_list = this.product_info_list.filter((product) =>{
            return product.sell_type == type_name;
        });

        if(_filtered_product_info_list.length == 0){
            Index.g_sys_msg_q.enqueue('에러', type_name + " 제품 정보를 찾을수 없습니다.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        let selected_product_id = product_id == undefined ? _filtered_product_info_list[0]._id : product_id;
        
        this.onChangeProduct(selected_product_id, (err, _product_info) =>{

            let new_state = { 
                filtered_product_info_list : _filtered_product_info_list,
                kream_product_info : undefined
            };

            if(_product_info){
                new_state.selected_product = _product_info;
                new_state.use_reservation = _product_info.sell_type !== common.SELL_TYPE.normal;
            }
            this.setState(_ => (new_state), ()=>{ this.getKreamProductInfo(); });
        });
    }

    onChangeUseReservation(e){
        this.setState(_ => ({
            use_reservation : e.target.checked
        }));
    }

    onSubmitTaskInfo(){

        if(this.state.selected_product == undefined){
            Index.g_sys_msg_q.enqueue('에러', "상품이 선택되지 않았습니다.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(this.state.selected_product.sell_type === common.SELL_TYPE.custom){
            const custom_product_name = document.getElementById(this.EL_ID_MODAL_INPUT_CUSTOM_PRODUCT_NAME);
            if(custom_product_name.value === '' || custom_product_name.value === undefined){
                Index.g_sys_msg_q.enqueue('에러', "상품 이름을 입력하지 않았습니다.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }else{
                common.update_product_info_obj(this.state.selected_product, 'name', custom_product_name.value);
            }
        }

        let selected_size_list = this.ref_options_size.current.getSelectedOptionValues();
        if(selected_size_list.length == 0){
            Index.g_sys_msg_q.enqueue('에러', "사이즈가 선택되지 않았습니다.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }else if(selected_size_list.length === 1 && selected_size_list[0].includes('무작위')){
            selected_size_list = this.ref_options_size.current.getAllOptionValues();
        }

        selected_size_list = selected_size_list.filter(selected_size => ( !selected_size.includes('무작위') )); // 무작위 사이즈는 리스트에서 제거한다.

        const watchdog = this.ref_options_size.current.getToggleValue();
        if(watchdog){
            Index.g_sys_msg_q.enqueue('경고', "품절된 사이즈를 등록했습니다. 구매 가능한 사이즈가 확인되면 지정한 사이즈와 가장 유사한 사이즈를 자동 구매합니다.", ToastMessageQueue.TOAST_MSG_TYPE.WARN, 8000);
        }

        let selected_account_email_list = this.ref_options_account.current.getSelectedOptionValues();
        if(selected_account_email_list.length == 0){
            Index.g_sys_msg_q.enqueue('에러', "구매할 계정을 선택하지 않았습니다.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(selected_account_email_list.includes(TaskEditModal.ACCOUNT_OPTION_NAME_ALL)){
            selected_account_email_list = this.state.account_info_list.map((account_info) => account_info.email);
        }

        let selected_schedule = undefined;
        
        if(this.state.use_reservation){
            selected_schedule = this.schedule_time_input_instance.selectedDates;
            if(selected_schedule.length == 0){
                Index.g_sys_msg_q.enqueue('에러', "작업 예약(시작) 시간을 설정하지 않았습니다.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }
            selected_schedule = selected_schedule[0];
        }

        const selected_proxy_id = this.ref_options_proxy.current.getSelectedOptionKey();
        let selected_proxy_info_list = [];

        if(selected_proxy_id === '분할할당'){
            selected_proxy_info_list = this.state.proxy_info_list; // 분할 할당을 선택하면 모든 프록시를 지정한다.( 모든 프록시를 각각의 계정에 분할해서 할당하기 위함이다.)
        }else if(selected_proxy_id != ''){
            selected_proxy_info_list = this.state.proxy_info_list.filter((proxy_info) => proxy_info._id == selected_proxy_id );
        }
        
        this.props.h_create_task(this.state.selected_product, selected_size_list, selected_account_email_list, selected_schedule, selected_proxy_info_list, watchdog);
        
        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.hide();
    }

    onClickProductImg(){
        if(this.state.selected_product === undefined) return;
        if(this.state.selected_product.url === undefined || this.state.selected_product.url === '') return;
        window.electron.openExternalWebPage(this.state.selected_product.url);
    }

    render(){

        let sell_type_list = ProductManager.getValueList(this.product_info_list, 'sell_type', false);
        let product_name_list = ProductManager.getProductDescNameList(this.state.filtered_product_info_list);
        let product_id_list = ProductManager.getValueList(this.state.filtered_product_info_list, '_id');

        let product_img_url = this.state.selected_product == undefined ? './res/img/exclamation-diamond.svg' : this.state.selected_product.img_url;
        let product_desc_name = this.state.selected_product == undefined ? '' : ProductManager.getProductDescName(this.state.selected_product);

        const size_list_info = ProductManager.getProductSizeList(this.state.selected_product);
        size_list_info.forEach((size_list) => {
            if(size_list.length > 0) size_list.unshift('🎲무작위');
        });
        const size_list_data = [
            {
                label : '사이즈',
                class : 'col-form-label font-weight-bold task-edit-modal-option-label',
                options : size_list_info[0]
            },
            {
                label : '품절',
                class : 'col-form-label font-weight-bold task-edit-modal-option-label-danger',
                options : size_list_info[1]
            }
        ];


        let account_email_list = this.state.account_info_list.map((account_info) => account_info.email);
        if(account_email_list.length > 0){
            account_email_list.unshift(TaskEditModal.ACCOUNT_OPTION_NAME_ALL);
        }

        let open_time_str = this.state.selected_product == undefined ? '' : common.get_formatted_date_str(this.state.selected_product.open_time, true);
        let close_time_str = this.state.selected_product == undefined ? '' : common.get_formatted_date_str(this.state.selected_product.close_time, true);

        let product_sell_type = this.state.selected_product == undefined ? undefined : this.state.selected_product.sell_type;

        if(this.schedule_time_input_instance !== undefined && this.state.use_reservation){
            if(open_time_str != ''){
                this.schedule_time_input_instance.setDate(open_time_str, false);
            }else{
                this.schedule_time_input_instance.setDate(common.get_formatted_date_str(new Date(), true), false);
            }
        }

        let porxy_alias_list = this.state.proxy_info_list.map((proxy_info => proxy_info.alias));
        let porxy__id_list = this.state.proxy_info_list.map((proxy_info => proxy_info._id));

        if(porxy__id_list.length > 0){ // 프로그램에 등록된 프록시가 최소 1개 이상 있을경우, '분할 할당' 옵션을 추가한다.
            porxy_alias_list.unshift('⚡분할 할당'); // 프록시를 선택하지 않는 옵션을 추가한다.
            porxy__id_list.unshift('분할할당'); // 프록시를 선택하지 않는 옵션을 추가한다.
        }

        porxy_alias_list.unshift(''); // 프록시를 선택하지 않는 옵션을 추가한다.
        porxy__id_list.unshift(''); // 프록시를 선택하지 않는 옵션을 추가한다.

        let modal_title_text = '';
        if(this.state.selected_product) modal_title_text = this.state.selected_product.sell_type === common.SELL_TYPE.custom ? '커스텀 작업 생성하기' : product_desc_name;

        const show_product_open_time = ![common.SELL_TYPE.normal, common.SELL_TYPE.custom].includes(product_sell_type);
        const show_custom_product_name_input = product_sell_type == common.SELL_TYPE.custom;

        let model_id = '';
        if(this.state.selected_product !== undefined && this.state.selected_product.model_id !== undefined){
            model_id = this.state.selected_product.model_id;
        }

        //kream 시세 정보를 표시하기 위한 코드
        let kream_price_label_class_name = 'task-edit-modal-option-label-verbose';
        let kream_price_str = '정보 없음';

        if(this.state.selected_product !== undefined && this.state.kream_product_info !== undefined){
            const price_gap = common.getPriceGap(this.state.kream_product_info.price, this.state.selected_product.price);
            if(price_gap > 0){
                kream_price_label_class_name = 'task-edit-modal-option-label-info';
            }else if(price_gap < 0){
                kream_price_label_class_name = 'task-edit-modal-option-label-danger';
            }

            kream_price_str = this.state.kream_product_info.price;
        }

        
        return (
            <div className="modal" id={this.props.id} tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={this.props.id + '-label'}>{modal_title_text}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row" style={{marginBottom : 30}}>
                                <div className="text-center">
                                    <div ref={this.ref_loading_div} className="tesk-edit-modal-loding-div d-flex align-items-center justify-content-center">
                                        <div className="spinner-border tesk-edit-modal-spinner-product" role="status"/>    
                                    </div>
                                    <img ref={this.ref_product_img} 
                                        className="rounded tesk-edit-modal-product-img" 
                                        src={product_img_url} 
                                        alt={product_desc_name} 
                                        onClick={this.onClickProductImg.bind(this)}
                                    />
                                </div>
                            </div>
                            <div className="row" style={{display : show_custom_product_name_input ? 'none' : ''}}>
                                <div className="col-md-6">
                                    <LabelSelect ref={this.ref_options_type} label="유형" options={sell_type_list} h_on_change={this.onChangeType.bind(this)}/>
                                </div>
                                <div className="col-md-6">
                                    <LabelSelect ref={this.ref_options_product} label="상품" options={product_name_list} option_keys={product_id_list} h_on_change={this.onChangeProduct.bind(this)}/>
                                </div>
                            </div>
                            <div className="row" style={{display : show_custom_product_name_input ? '' : 'none'}}>
                                <div className="col-md-12">
                                    <div className="form-floating">
                                        <input type="text" className="form-control" id={this.EL_ID_MODAL_INPUT_CUSTOM_PRODUCT_NAME} style={{"--width" : "100%"}} placeholder="조던 1 하이 XXX" />
                                        <label className="common-input-label" htmlFor={this.EL_ID_MODAL_INPUT_CUSTOM_PRODUCT_NAME}>상품 이름 입력란</label>
                                    </div>
                                </div>
                            </div>
                            <hr/>
                            <div className="row" style={{display : show_product_open_time ? '' : 'none'}}>
                                <div className="col-md-2">
                                    <label className="task-edit-modal-option-label">시작</label>
                                </div>
                                <div className="col-md-4">
                                    <label>{open_time_str == '' ? 'Unknown' : open_time_str}</label>
                                </div>
                                <div className="col-md-2 ">
                                    <label className="task-edit-modal-option-label">종료</label> 
                                </div>
                                <div className="col-md-4">
                                    <label>{close_time_str == '' ? 'Unknown' : close_time_str}</label>
                                </div>
                            </div>
                            <hr style={{display : show_product_open_time ? '' : 'none'}}/>
                            <div className="row">
                                <div className="col-md-2" style={{marginTop: 8}}>
                                    <label className="task-edit-modal-option-label">예약</label>
                                </div>
                                <div className="col-md-8">
                                    <input 
                                        id={this.EL_ID_MODAL_INPUT_SCHDULE_TIME} 
                                        className="modal-select form-control" 
                                        disabled={!this.state.use_reservation}
                                        style={{'--width' : '450px', '--color' : this.state.use_reservation ? 'white' : 'transparent'}}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <div className="form-check form-switch" style={{marginTop: 8}}>
                                        <input 
                                            className="form-check-input" 
                                            key={this.state.use_reservation ? 'use-reservation-true' : 'use-reservation-false'} 
                                            type="checkbox" role="switch" 
                                            onChange={this.onChangeUseReservation.bind(this)} 
                                            defaultChecked={this.state.use_reservation}
                                        />
                                    </div>
                                </div>
                            </div>
                            <hr/>
                            <div className="row">
                                <div className="col-md-5">
                                    <LabelMultipleSelectDual 
                                        ref={this.ref_options_size}
                                        data={size_list_data}
                                    />
                                </div>
                                <div className="col-md-7">
                                    <LabelMultipleSelect ref={this.ref_options_account} label="계정" options={account_email_list}/>
                                </div>
                            </div>
                            <hr/>
                            <div className="row">
                                <label className="col-md-2 col-form-label font-weight-bold task-edit-modal-option-label">가격</label>
                                <label className="col-md-4 col-form-label font-weight-bold task-edit-modal-option-label">
                                    {this.state.selected_product == undefined ? '' : this.state.selected_product.price}
                                </label>
                                <label className="col-md-3 col-form-label font-weight-bold task-edit-modal-option-label">크림가격</label>
                                <label className={`col-md-3 col-form-label font-weight-bold ${kream_price_label_class_name}`}>
                                    {kream_price_str}
                                </label>
                            </div>
                            <hr/>
                            <div className="row" style={{display : show_product_open_time ? '' : 'none'}}>
                                <div className="col-md-2">
                                    <label className="task-edit-modal-option-label">모델</label>
                                </div>
                                <div className="col-md-4">
                                    <label>{model_id}</label>
                                </div>
                                <div className="col-md-6">
                                    <LabelSelect ref={this.ref_options_proxy} label="프록시" label_col_class="col-md-4" select_col_class="col-md-8" options={porxy_alias_list} option_keys={porxy__id_list}/>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">취소</button>
                            <button type="button" ref={this.ref_ok_btn} className="btn btn-primary btn-inner-modal" onClick={this.onSubmitTaskInfo.bind(this)}>생성</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}