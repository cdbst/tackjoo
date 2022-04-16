class TimeSelectModal extends React.Component {

    static ID = 'global-time-select-modal';
    static TIME_INPUT_ID = 'global-time-select-modal-time-input';

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
            modal_content_style : {
                width: 360, 
                height: 210
            }
        };

        this.time_input_instance = undefined;
    }

    componentDidMount(){
        this.__mount = true;

        let el_modal = document.getElementById(TimeSelectModal.ID);
        el_modal.removeEventListener('hidden.bs.modal', this.onModalClosed);
        el_modal.addEventListener('hidden.bs.modal', this.onModalClosed);

        this.time_input_instance = flatpickr(`#${TimeSelectModal.TIME_INPUT_ID}`, {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            minuteIncrement : 1,
            dateFormat: "y.m.d H:i:S",
            locale: "ko",
            static : true,
            onOpen : () => {
                this.setState({modal_content_style : {width: 360, height: 550}});
            },
            onClose : () => {
                this.setState({modal_content_style : {width: 360, height: 210}});
            },
        });
    }


    componentWillUnmount(){
        this.__mount = false;
    }

    onPopModal(_modal_title, h_modal_close){

        this.setState({ modal_title : _modal_title }, () => {
            this.time_input_instance.setDate(common.get_formatted_date_str(new Date(), true), false);
            this.__h_modal_close = h_modal_close;
            let el_modal = document.getElementById(TimeSelectModal.ID);
            let bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
            bs_obj_modal.show();
        });
    }

    onModalClosed(){

        selected_schedule = this.time_input_instance.selectedDates;
        if(selected_schedule.length === 0){
            Index.g_sys_msg_q.enqueue('에러', "작업 예약(시작) 시간을 설정하지 않았습니다.", ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }
        selected_schedule = selected_schedule[0];

        this.__h_modal_close(this.__click_ok, selected_schedule);
        this.__h_modal_close = undefined;
        this.__click_ok = false;
    }

    onClickOkBtn(){
        this.__click_ok = true;

        let el_modal = document.getElementById(TimeSelectModal.ID);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.hide();
    }

    render(){
        return(
            <div id={TimeSelectModal.ID} className="modal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content" style={this.state.modal_content_style}>
                        <div className="modal-header">
                            <h5 className="modal-title">{this.state.modal_title}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input 
                                id={TimeSelectModal.TIME_INPUT_ID} 
                                className="modal-select form-control time-input-select" 
                                style={{'--width' : '308px', textAlignLast : 'center'}}
                            />
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

class TimeSelectModalHandler{
    constructor(modal_ref) {
        this.setModalRef = this.setModalRef.bind(this);
        this.popModal = this.popModal.bind(this);

        this.__modal_ref = modal_ref;
    }

    setModalRef(modal_ref){
        this.__modal_ref = modal_ref;
    }

    popModal(modal_title, h_modal_close){
        this.__modal_ref.current.onPopModal(modal_title, h_modal_close);
    }
}