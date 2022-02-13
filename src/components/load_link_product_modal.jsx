class LoadLinkProductModal extends React.Component {

    EL_ID_MODAL_INPUT_PRODUCT_LINK = 'product-link-input';

    constructor(props) {
        super(props);

        this.accounts = undefined;
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onSubmitLoad = this.onSubmitLoad.bind(this);
        this.onModalshown = this.onModalshown.bind(this);
    }

    componentDidMount(){
        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);
    }

    onModalshown(e){
        let el_product_link_input = document.getElementById(this.EL_ID_MODAL_INPUT_PRODUCT_LINK);
        el_product_link_input.focus();
    }

    onModalClosed(e){        
        let el_product_link_input = document.getElementById(this.EL_ID_MODAL_INPUT_PRODUCT_LINK);

        el_product_link_input.value = '';
    }

    onSubmitLoad(e){

        e.preventDefault();
        
        let el_product_link_input = document.getElementById(this.EL_ID_MODAL_INPUT_PRODUCT_LINK);

        //Idd Item Needed;
        this.props.h_load_product(el_product_link_input.value);

        let el_modal = document.getElementById(this.props.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        
        bs_obj_modal.hide();
    }

    render(){
        return (
            <div className="modal" id={this.props.id}  tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={this.props.id + '-label'}>링크로 상품 불러오기</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3 row">
                                <form onSubmit={(e)=>{e.preventDefault();}}>
                                    <label htmlFor={this.EL_ID_MODAL_INPUT_PRODUCT_LINK} className="col-sm-2 col-form-label font-weight-bold">상품 링크</label>
                                    <div className="col-sm-10">
                                        <input type="text" className="form-control" id={this.EL_ID_MODAL_INPUT_PRODUCT_LINK} style={{'--width' : '450px'}}/>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">취소</button>
                            <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onSubmitLoad.bind(this)}>불러오기</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}