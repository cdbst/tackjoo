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
            modal_contents_text : ''
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

    onPopModal(_modal_title, _modal_contents_text, h_modal_close){

        this.setState({ modal_title : _modal_title, modal_contents_text : _modal_contents_text}, () => {
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
            <div id={PromptModal.id} className="modal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{this.state.modal_title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>{this.state.modal_contents_text}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onClickOkBtn.bind(this)}>OK</button>
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

    popModal(modal_title, modal_contents_text, h_modal_close){
        this.__modal_ref.current.onPopModal(modal_title, modal_contents_text, h_modal_close);
    }
}