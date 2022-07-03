class ReturnableRequestModal extends React.Component {

    EL_INPUT_USE_DEFAULT_RETURN_ADDR = 'input-use-default-return-addr';
    EL_ID_CUSTOM_ADDR_USER_NAME = 'input-custom-addr-user-name';
    EL_ID_CUSTOM_ADDR_PHONE_NUMBER = 'input-custom-addr-phone-number';
    EL_ID_CUSTOM_ADDR_DETAIL_ADDR = 'input-custom-addr-detail-addr';
    EL_ID_RETURN_MEMO = 'input-return-memo';
    EL_ID_RETURN_REASON = 'input-return-reasion';
    EL_ID_RETURN_DETAIL_REASON = 'input-return-detail-reasion';

    constructor(props) {
        super(props);

        this.accounts = undefined;
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onSubmitReturnable = this.onSubmitReturnable.bind(this);
        this.onModalshown = this.onModalshown.bind(this);
        this.getReturnableItemList = this.getReturnableItemList.bind(this);
        this.onChangeUseDefaultReturnAddr = this.onChangeUseDefaultReturnAddr.bind(this);
        this.cleanupForm = this.cleanupForm.bind(this);
        this.checkFormValidation = this.checkFormValidation.bind(this);

        this.__ref_custom_user_addr_form = React.createRef();
        this.__ref_request_return_btn = React.createRef();

        this.__inprogress_submit = false;

        this.state = {
            returnable_item_list : [],
            use_default_return_addr : true
        }
    }

    componentDidMount(){
        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('hide.bs.modal', this.onModalWillClosed.bind(this));
        el_modal.addEventListener('hide.bs.modal', this.onModalWillClosed.bind(this));

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);
    }

    onChangeUseDefaultReturnAddr(e){
        this.setState({ use_default_return_addr : e.target.checked });
    }

    onModalshown(e){
        
        const el_modal = document.getElementById(this.props.id);

        const _returnable_item_list = this.getReturnableItemList(el_modal.returnable_info_list);
        this.setState({ 
            returnable_item_list : _returnable_item_list,
            use_default_return_addr : true
        }, ()=>{
            this.__inprogress_submit = false;
            this.__ref_request_return_btn.current.setDisabled(false);
            document.getElementById(this.EL_INPUT_USE_DEFAULT_RETURN_ADDR).checked = true;
            //모달이 열렸을때 기본적으로 포커싱 되어야할 input에 포커싱 시킨다.
            document.getElementById(this.EL_ID_RETURN_MEMO).focus();
        });
    }

    onModalWillClosed(e){
        if(this.__inprogress_submit){
            Index.g_sys_msg_q.enqueue('에러', '반품 작업이 진행중입니다. 완료될 때 까지 기다려주세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            e.preventDefault();
            return;
        }
    }

    onModalClosed(){
        this.cleanupForm();
    }

    onSubmitReturnable(){

        const submit_returnable_info = this.checkFormValidation();
        if(submit_returnable_info === undefined) return;

        this.__inprogress_submit = true;
        this.__ref_request_return_btn.current.setLoadingStatus(true);

        const returnable_info_list = document.getElementById(this.props.id).returnable_info_list;

        window.electron.requestReturnable(returnable_info_list, submit_returnable_info, (completed, data)=>{
            if(completed){
                Index.g_sys_msg_q.enqueue('안내', '반품 작업이 종료되었습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
                this.__ref_request_return_btn.current.setLoadingStatus(false);
                this.__ref_request_return_btn.current.setDisabled(true);
                this.__inprogress_submit = false;

                //아래 부터는 반품 작업이 완료됐을 때 처리되어야 할 코드들임.
                // this.props.h_submit_returnable([]);

                // let el_modal = document.getElementById(this.props.id);
                // var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
                // bs_obj_modal.hide();
                return;
            }

            const returnable_info_id = data.returnable_info_id;
            const result = data.result;
        });
    }

    getReturnableItemList(returnable_info_list){

        return returnable_info_list.map((returnable_info) => {
            return (
                <li className="list-group-item d-flex justify-content-between align-items-start" key={`returnable-tiem-${returnable_info._id}`}>
                    <img 
                        className="rounded product-table-item-img" 
                        src={returnable_info.product_img_url} 
                        alt={returnable_info.product_name} 
                        style={{width:56, height:56}} 
                    />
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">{returnable_info.product_name}</div>
                        {returnable_info.account_email}
                    </div>
                    <span className="badge bg-info rounded-pill">{`옵션 : ${returnable_info.product_option}`}</span>
                </li>
            );
        });
    }

    cleanupForm(){

        this.setState({ 
            returnable_item_list : [],
            use_default_return_addr : true
        }, ()=>{
            document.getElementById(this.props.id).returnable_info_list = undefined;
            document.getElementById(this.EL_INPUT_USE_DEFAULT_RETURN_ADDR).checked = true;
            document.getElementById(this.EL_ID_RETURN_MEMO).value = '';
            document.getElementById(this.EL_ID_RETURN_REASON).value = 'UP_SIZE_CHANGE';
            document.getElementById(this.EL_ID_RETURN_DETAIL_REASON).value = '';
        });
    }

    checkFormValidation(){

        const submit_returnable_info =  common.get_submit_returnable_obj_scheme();
        
        const use_default_return_addr = document.getElementById(this.EL_INPUT_USE_DEFAULT_RETURN_ADDR).checked;
        common.update_submit_returnable_obj(submit_returnable_info, 'use_default_return_addr', use_default_return_addr);

        if(use_default_return_addr === false){

            const return_addr_info = common.get_user_addr_info_obj_scheme();
            common.update_user_addr_info_obj(return_addr_info, '_id', common.uuidv4());

            const selected_addr_info =  this.__ref_custom_user_addr_form.current.selected_addr_info;
            if(selected_addr_info === undefined){
                Index.g_sys_msg_q.enqueue('에러', '주소 정보가 올바로 입력된 상태가 아닙니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return undefined;
            }

            const postal_code = this.__ref_custom_user_addr_form.current.getPostalCode();
            if(postal_code === undefined){
                Index.g_sys_msg_q.enqueue('에러', '주소 정보가 올바로 입력된 상태가 아닙니다.(우편 번호)', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return undefined;
            }
            common.update_user_addr_info_obj(return_addr_info, 'postal_code', postal_code);

            const city = this.__ref_custom_user_addr_form.current.getCity();
            if(city === undefined){
                Index.g_sys_msg_q.enqueue('에러', '주소 정보가 올바로 입력된 상태가 아닙니다.(도시명)', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return undefined;
            }
            common.update_user_addr_info_obj(return_addr_info, 'city', city);

            const address = this.__ref_custom_user_addr_form.current.getValue();
            common.update_user_addr_info_obj(return_addr_info, 'address', address);

            const user_name = document.getElementById(this.EL_ID_CUSTOM_ADDR_USER_NAME).value;
            if(user_name.length === 0){
                Index.g_sys_msg_q.enqueue('에러', '고객명을 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return undefined;
            }
            common.update_user_addr_info_obj(return_addr_info, 'user_name', user_name);

            const phone_number = document.getElementById(this.EL_ID_CUSTOM_ADDR_PHONE_NUMBER).value;
            if(phone_number.length === 0){
                Index.g_sys_msg_q.enqueue('에러', '전화번호를 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return undefined;
            }else if(new RegExp('^[0-9]+$').test(phone_number) === false){
                Index.g_sys_msg_q.enqueue('에러', '전화번호를 잘못입력 했습니다. 숫자로만 입력해야합니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return undefined;
            }
            common.update_user_addr_info_obj(return_addr_info, 'phone_number', phone_number);

            const address_detail = document.getElementById(this.EL_ID_CUSTOM_ADDR_DETAIL_ADDR).value;
            if(address_detail.length === 0){
                Index.g_sys_msg_q.enqueue('에러', '나머지 주소를 입력하지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return undefined;
            }
            common.update_user_addr_info_obj(return_addr_info, 'address_detail', address_detail);

            common.update_submit_returnable_obj(submit_returnable_info, 'return_addr_info', return_addr_info);
        }

        const return_memo = document.getElementById(this.EL_ID_RETURN_MEMO).value;
        if(return_memo.length < 5){
            Index.g_sys_msg_q.enqueue('에러', '수거 메모를 5자 이상 입력하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return undefined;
        }else if (return_memo.length > 50){
            Index.g_sys_msg_q.enqueue('에러', '수거 메모를 50자 이내로 입력하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return undefined;
        }
        common.update_submit_returnable_obj(submit_returnable_info, 'return_memo', return_memo);

        const return_reason = document.getElementById(this.EL_ID_RETURN_REASON).value;
        common.update_submit_returnable_obj(submit_returnable_info, 'return_reason', return_reason);

        const return_detail_reason = document.getElementById(this.EL_ID_RETURN_DETAIL_REASON).value;
        if(return_detail_reason.length < 5){
            Index.g_sys_msg_q.enqueue('에러', '반품 상세 사유를 5글자 이상 입력하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return undefined;
        }
        common.update_submit_returnable_obj(submit_returnable_info, 'return_detail_reason', return_detail_reason);

        common.update_submit_returnable_obj(submit_returnable_info, '_id', common.uuidv4());
        return submit_returnable_info;
    }

    render(){
        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={this.props.id + '-label'}>반품 신청하기</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{maxHeight: 840, height: 840, overflowX:'hidden', overflowY:'auto'}}>
                            <div className="row">
                                <label className="col-md-12 col-form-label font-weight-bold task-edit-modal-option-label">{`반품 신청 항목(${this.state.returnable_item_list.length}개)`}</label>
                            </div>
                            <div className="row" style={{maxHeight: 320, overflowX:'hidden', overflowY:'auto'}}>
                                <ul className="list-group list-group-flush moadal-list-group">
                                    {this.state.returnable_item_list}
                                </ul>
                            </div>
                            <hr/>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-switch" style={{paddingLeft: 0}}>
                                        <label htmlFor={this.EL_INPUT_USE_DEFAULT_RETURN_ADDR} className="form-check-label col-form-label font-weight-bold task-edit-modal-option-label">기본 수거지를 사용합니다</label>
                                        <input 
                                            id={this.EL_INPUT_USE_DEFAULT_RETURN_ADDR} 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            role="switch"
                                            style={{marginLeft: 10, marginTop: 12}}
                                            onChange={this.onChangeUseDefaultReturnAddr.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                            {this.state.use_default_return_addr === false &&
                                <div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input type="text" className="form-control modal-floating-input" id={this.EL_ID_CUSTOM_ADDR_USER_NAME} style={{"--width" : "100%"}} placeholder="고객명" />
                                                <label className="modal-floating-label" htmlFor={this.EL_ID_CUSTOM_ADDR_USER_NAME}>고객명</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input type="text" className="form-control modal-floating-input" id={this.EL_ID_CUSTOM_ADDR_PHONE_NUMBER} style={{"--width" : "100%"}} placeholder="-없이 입력" />
                                                <label className="modal-floating-label" htmlFor={this.EL_ID_CUSTOM_ADDR_PHONE_NUMBER}>연락처(-없이 입력)</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row" style={{marginTop: 4}}>
                                        <div className="col-md-12">
                                            <AddressSearchForm ref={this.__ref_custom_user_addr_form} width={380} />
                                        </div>
                                    </div>
                                    <div className="row" style={{marginTop: 4}}>
                                        <div className="col-md-12">
                                            <input type="text" className="form-control" placeholder="나머지 주소 입력" id={this.EL_ID_CUSTOM_ADDR_DETAIL_ADDR} style={{'--width' : '468px'}}/>
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                            }
                            <div className="row">
                                <div className="row">
                                    <div className="col-md-12">
                                        <input type="text" className="form-control" placeholder="수거 메모 입력" id={this.EL_ID_RETURN_MEMO} style={{'--width' : '468px'}}/>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="row">
                                <label className="col-md-12 col-form-label font-weight-bold task-edit-modal-option-label">반품 사유</label>
                            </div>
                            <div className="row" style={{marginTop: 4}}>
                                <div className="col-md-12">
                                    <select id={this.EL_ID_RETURN_REASON} className="form-select form-select-down-arrw modal-select">
                                        <option className="select-option" value="UP_SIZE_CHANGE">사이즈가 큼</option>
                                        <option className="select-option" value="DOWN_SIZE_CHANGE">사이즈가 작음</option>
                                        <option className="select-option" value="COLOR_CHANGE">화면과 색상이 상이함</option>
                                        <option className="select-option" value="DESIGN_CHANGE">화면과 디자인이 상이함</option>
                                        <option className="select-option" value="NO_PURCHASE_INTENT">단순 변심</option>
                                        <option className="select-option" value="PRODUCT_FAULT">파손 및 상품 결함</option>
                                        <option className="select-option" value="PRODUCT_DAMAGE_MISSING">오배송</option>
                                        <option className="select-option" value="PRODUCT_NOT_ARRIVE">상품 미도착</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row" style={{marginTop: 4}}>
                                <div className="col-md-12">
                                    <input type="text" className="form-control" placeholder="반품 상세 사유" id={this.EL_ID_RETURN_DETAIL_REASON} style={{'--width' : '468px'}}/>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">닫기</button>
                            <LaodingButton
                                ref={this.__ref_request_return_btn}
                                h_on_click={this.onSubmitReturnable.bind(this)}
                                btn_label={"반품요청"}
                                btn_class={"btn btn-primary btn-inner-modal"}
                                img_src={"./res/img/product-return.png"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}