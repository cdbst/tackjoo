class TextareaEditModal extends React.Component {

    EL_ID_MODAL_TEXTAREA = 'modal-textarea';

    constructor(props) {
        super(props);

        this.accounts = undefined;
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onModalshown = this.onModalshown.bind(this);

        this.editor = undefined;
    }

    componentDidMount(){
        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);

        const textarea = document.getElementById(this.EL_ID_MODAL_TEXTAREA);

        this.editor = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true
        });
        this.editor.setOption('theme', 'midnight');
    }

    onModalshown(e){
        this.editor.focus();
    }

    onModalClosed(e){
        
        //let el_textarea = document.getElementById(this.EL_ID_MODAL_TEXTAREA);
        //el_textarea.value = '';
    }

    onSubmit(e){

        e.preventDefault();

        //Idd Item Needed;
        this.props.h_submit(this.editor.getValue());

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
                            <h5 className="modal-title" id={this.props.id + '-label'}>{this.props.title}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label htmlFor={this.EL_ID_MODAL_TEXTAREA} className="col-sm-12 col-form-label font-weight-bold">{this.props.desc}</label>
                            </div>
                            <div >
                                <textarea className="modal-textarea" id={this.EL_ID_MODAL_TEXTAREA}/>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">취소</button>
                            <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onSubmit.bind(this)}>생성</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}