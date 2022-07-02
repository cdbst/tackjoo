class ReturnableRequestModal extends React.Component {

    EL_ID_RETURNALBE_ITEM_LIST = 'input-returnable-item-list';
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

        this.state = {
            returnable_item_list : [],
            use_default_return_addr : true
        }
    }

    componentDidMount(){
        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);
    }

    onChangeUseDefaultReturnAddr(e){
        this.setState({ use_default_return_addr : e.target.checked });
    }

    onModalshown(e){
        //TODO: 모달이 열렸을때 기본적으로 포커싱 되어야할 input에 포커싱 시킨다.
        const el_modal = document.getElementById(this.props.id);

        const el_input_use_default_return_addr = document.getElementById(this.EL_INPUT_USE_DEFAULT_RETURN_ADDR);
        el_input_use_default_return_addr.checked = true;

        const _returnable_item_list = this.getReturnableItemList(el_modal.returnable_info_list);
        this.setState({ 
            returnable_item_list : _returnable_item_list,
            use_default_return_addr : true
        });
    }

    onModalClosed(e){
        //TODO: 초기화 해야할 내부 컨텐츠 텍스트들을 초기화한다.

        this.setState({ 
            returnable_item_list : [],
            use_default_return_addr : true
        });

        const el_modal = document.getElementById(this.props.id);
        el_modal.returnable_info_list = undefined;
    }

    onSubmitReturnable(e){

        e.preventDefault();

        //TODO: 입력된 값들의 유효성 검사를 나이키 공식홈페이지 기준의 입력값 검증 방식과 똑같이 수행해야한다.

        this.props.h_submit_returnable([]);

        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.hide();
    }

    getReturnableItemList(returnable_info_list){
        //return returnable_info_list.map((returnable_info) => <li className="list-group-item">{`${returnable_info.account_email} - ${returnable_info.product_name} (${returnable_info.product_option})`}</li>)

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

    render(){
        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
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
                                            <AddressSearchForm width={380} />
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
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">취소</button>
                            <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onSubmitReturnable.bind(this)}>확인</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}