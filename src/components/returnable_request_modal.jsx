class ReturnableRequestModal extends React.Component {

    EL_ID_RETURNALBE_ITEM_LIST = 'input-returnable-item-list';

    constructor(props) {
        super(props);

        this.accounts = undefined;
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onSubmitReturnable = this.onSubmitReturnable.bind(this);
        this.onModalshown = this.onModalshown.bind(this);
        this.getReturnableItemList = this.getReturnableItemList.bind(this);

        this.state = {
            returnable_item_list : [],
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
        // 모달이 열렸을때 기본적으로 포커싱 되어야할 input에 포커싱 시킨다.
        const el_modal = document.getElementById(this.props.id);

        const _returnable_item_list = this.getReturnableItemList(el_modal.returnable_info_list);
        this.setState({ returnable_item_list : _returnable_item_list});
    }

    onModalClosed(e){
        // 초기화 해야할 내부 컨텐츠 텍스트들을 초기화한다.

        this.setState({ returnable_item_list : []});

        const el_modal = document.getElementById(this.props.id);
        el_modal.returnable_info_list = undefined;
    }

    onSubmitReturnable(e){

        e.preventDefault();

        this.props.h_submit_returnable([]);

        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.hide();
    }

    getReturnableItemList(returnable_info_list){
        //return returnable_info_list.map((returnable_info) => <li className="list-group-item">{`${returnable_info.account_email} - ${returnable_info.product_name} (${returnable_info.product_option})`}</li>)

        return returnable_info_list.map((returnable_info) => {
            return (
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                    <div class="fw-bold">{returnable_info.product_name}</div>
                        {returnable_info.account_email}
                    </div>
                    <span class="badge bg-info rounded-pill">{`옵션 : ${returnable_info.product_option}`}</span>
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
                        <div className="modal-body" style={{maxHeight: 800, overflowX:'hidden', overflowY:'auto'}}>
                            <div className="row">
                                <label className="col-md-12 col-form-label font-weight-bold task-edit-modal-option-label">반품 신청 항목(3개)</label>
                            </div>
                            <div className="row" style={{maxHeight: 320, overflowX:'hidden', overflowY:'auto'}}>
                                <ul className="list-group list-group-flush moadal-list-group">
                                    {this.state.returnable_item_list}
                                </ul>
                            </div>
                            <hr/>
                            <div className="row">
                                <label className="col-md-12 col-form-label font-weight-bold task-edit-modal-option-label">수거지 선택</label>
                            </div>
                            <hr/>
                            <div className="row">
                                <label className="col-md-12 col-form-label font-weight-bold task-edit-modal-option-label">수거 메모 선택</label>
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