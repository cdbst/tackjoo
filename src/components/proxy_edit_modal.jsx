class ProxyEditModal extends React.Component {

    static EL_ID_MODAL_INPUT = {
        IP : 'proxy-ip-input',
        PORT : 'proxy-port-input',
        ID : 'proxy-id-input',
        PWD : 'proxy-pwd-input',
        ALIAS : 'proxy-alias-input'
    }

    constructor(props) {
        super(props);

        this.accounts = undefined;
        this.onModalClosed = this.onModalClosed.bind(this);
        this.onSubmitProxyInfo = this.onSubmitProxyInfo.bind(this);
        this.onModalshown = this.onModalshown.bind(this);
        this.inputValue = this.inputValue.bind(this);

        this.proxy_info_id = undefined;
    }

    inputValue(id, value){
        let el_input = document.getElementById(id);
        if(value == undefined) return el_input.value;
        el_input.value = value;
    }

    componentDidMount(){
        let el_modal = document.getElementById(this.props.id);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        el_modal.removeEventListener('shown.bs.modal', this.onModalshown);
        el_modal.addEventListener('shown.bs.modal', this.onModalshown);
    }

    onModalshown(e){
        let el_ip_input = document.getElementById(ProxyEditModal.EL_ID_MODAL_INPUT.IP);
        el_ip_input.focus();
    }

    onModalClosed(e){
        this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.IP, '');
        this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.PORT, '');
        this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.ID, '');
        this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.PWD, '');
        this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.ALIAS, '');

        this.proxy_info_id = undefined;
    }

    onSubmitProxyInfo(e){

        e.preventDefault();

        const h_update_cb = this.proxy_info_id == undefined ? this.props.h_create_proxy : this.props.h_modify_proxy;

        h_update_cb(
            this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.IP), 
            this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.PORT), 
            this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.ID), 
            this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.PWD), 
            this.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.ALIAS),
            this.proxy_info_id
        );

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
                            <h5 className="modal-title" id={this.props.id + '-label'}>프록시 정보 편집</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="row">
                                        <label htmlFor={ProxyEditModal.EL_ID_MODAL_INPUT.IP} className="col-sm-2 col-form-label font-weight-bold">IP</label>
                                        <input type="text" className="form-control" id={ProxyEditModal.EL_ID_MODAL_INPUT.IP} style={{'--width' : '170px'}}/>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="row">
                                        <label htmlFor={ProxyEditModal.EL_ID_MODAL_INPUT.PORT} className="col-sm-3 col-form-label font-weight-bold">포트</label>
                                        <input type="text" className="form-control" id={ProxyEditModal.EL_ID_MODAL_INPUT.PORT} style={{'--width' : '170px'}}/>
                                    </div>
                                </div>
                            </div>
                            <hr/>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="row">
                                        <label htmlFor={ProxyEditModal.EL_ID_MODAL_INPUT.ID} className="col-sm-2 col-form-label font-weight-bold">ID</label>
                                        <input type="text" className="form-control" id={ProxyEditModal.EL_ID_MODAL_INPUT.ID} style={{'--width' : '170px'}}/>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="row">
                                        <label htmlFor={ProxyEditModal.EL_ID_MODAL_INPUT.PWD} className="col-sm-3 col-form-label font-weight-bold">비번</label>
                                        <input type="password" name="password" className="form-control" id={ProxyEditModal.EL_ID_MODAL_INPUT.PWD} style={{'--width' : '170px'}}/>
                                    </div>
                                </div>
                            </div>
                            <hr/>
                            <div className="row">
                                <div className="col-md-12">
                                    <form onSubmit={this.onSubmitProxyInfo.bind(this)}>
                                        <div className="row">
                                            <label htmlFor={ProxyEditModal.EL_ID_MODAL_INPUT.ALIAS} className="col-sm-2 col-form-label font-weight-bold">이름</label>
                                            <input type="text" className="form-control" autoComplete="on" id={ProxyEditModal.EL_ID_MODAL_INPUT.ALIAS} style={{'--width' : '390px'}}/>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning btn-inner-modal" data-bs-dismiss="modal">취소</button>
                            <button type="button" className="btn btn-primary btn-inner-modal" onClick={this.onSubmitProxyInfo.bind(this)}>확인</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}