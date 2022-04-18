class PromptModal extends React.Component {

    static id = 'global-prompt-modal';

    constructor(props) {
        super(props);

        this.onPopModal = this.onPopModal.bind(this);
        this.onModalClosed =this.onModalClosed.bind(this);
        this.onClickOkBtn = this.onClickOkBtn.bind(this);

        this.__mount = false;
        this.__h_modal_close = undefined;
        this.__click_ok = false;

        this.state = {
            modal_title : '',
            modal_contents_tag : ''
        };
    }

    componentDidMount(){
        this.__mount = true;

        let el_modal = document.getElementById(PromptModal.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onPopModal(_modal_title, _modal_contents_tag, h_modal_close){

        this.setState({ modal_title : _modal_title, modal_contents_tag : _modal_contents_tag}, () => {
            this.__h_modal_close = h_modal_close;
            let el_modal = document.getElementById(PromptModal.id);
            let bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
            bs_obj_modal.show();
        });
    }

    onModalClosed(){
        this.__h_modal_close(this.__click_ok);
        this.__h_modal_close = undefined;
        this.__click_ok = false;
    }

    onClickOkBtn(){
        this.__click_ok = true;

        let el_modal = document.getElementById(PromptModal.id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.hide();
    }

    render(){
        return(
            <div id={PromptModal.id} className="modal" tabIndex="-1" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{this.state.modal_title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {this.state.modal_contents_tag}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">취소</button>
                        <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onClickOkBtn.bind(this)}>확인</button>
                    </div>
                    </div>
                </div>
            </div>
        )
    }
}

class PromptModalHandler{
    constructor(modal_ref) {
        this.setModalRef = this.setModalRef.bind(this);
        this.popModal = this.popModal.bind(this);

        this.__modal_ref = modal_ref;
    }

    setModalRef(modal_ref){
        this.__modal_ref = modal_ref;
    }

    popModal(modal_title, modal_contents_tag, h_modal_close){
        this.__modal_ref.current.onPopModal(modal_title, modal_contents_tag, h_modal_close);
    }
}