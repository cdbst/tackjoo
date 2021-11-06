
class TaskTableItem extends React.Component {

    static PLAY_BTN_SRC = './res/img/play-fill.svg';
    static PAUSE_BTN_SRC = './res/img/pause-fill.svg';

    constructor(props) {
        super(props);

        this.onClickRemoveBtn = this.onClickRemoveBtn.bind(this);
        this.onClickStatusBtn = this.onClickStatusBtn.bind(this);
        this.onAlamScheduledTime = this.onAlamScheduledTime.bind(this);

        this.onPlayTask = this.onPlayTask.bind(this);
        this.onPauseTask = this.onPauseTask.bind(this);
        this.setTaskStatus = this.setTaskStatus.bind(this);
        this.getStatusBtnSrc = this.getStatusBtnSrc.bind(this);

        this.isPossibleToPlay = this.isPossibleToPlay.bind(this);
        this.isPossibleToPause = this.isPossibleToPause.bind(this);

        this.__mount = false;

        this.ref_status_btn = React.createRef();

        this.retry_cnt_task_play = Index.g_app_config.MAX_RETRY_COUNT_TASK;

        //6. TODO TYPE_OF_TASK_COND 프로토타입
        // ready, stop, on product page, on cart page, ready to pay, complete
        // draw일경우 이미 신청된 것이라면 complete 바로 표시.
        // 각 단계 실행시 나이키 서버의 응답이 지연될 경우 재시도 간격을 얼마로 정할지 ?

        let initial_status = undefined;
        let cur_server_time = Index.g_server_clock.getServerTime();

        if((this.props.task_info.schedule_time != undefined) && this.props.task_info.schedule_time > cur_server_time){
            initial_status = common.TASK_STATUS.READY;
        }else{
            initial_status = common.TASK_STATUS.PAUSE;
        }

        this.state = {
            status : initial_status
        };
    }

    componentDidMount(){
        this.__mount = true;

        if(this.props.task_info.schedule_time != undefined){
            Index.g_server_clock.subscribeAlam(this.props.task_info.schedule_time, this.onAlamScheduledTime);
        }
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onAlamScheduledTime(_date){      
        this.onPlayTask(this.retry_cnt_task_play);
    }

    onPlayTask(retry_cnt, set_state = true){

        if(this.isPossibleToPlay() == false) return;
        this.ref_status_btn.current.disabled = true;

        let play_task = () => {

            Index.g_product_mngr.getProductInfo(this.props.task_info.product_info_id, (err, product_info) =>{

                if(ProductManager.isValidProductInfoToTasking(product_info) == false){

                    if(retry_cnt == 0){
                        this.setTaskStatus(common.TASK_STATUS.FAIL, ()=>{
                            this.ref_status_btn.current.disabled = false;
                        });
                    }else{
                        this.onPlayTask(retry_cnt - 1, false);
                    }

                    return;
                }
    
                window.electron.playTask(this.props.task_info, product_info, (status) =>{

                    this.setTaskStatus(status, ()=>{
                        this.ref_status_btn.current.disabled = false;
                    });
                });
            });
        }

        if(set_state){
            this.setTaskStatus(common.TASK_STATUS.PLAY, play_task);
        }else{
            play_task();
        }
    }

    onPauseTask(__callback){

        if(this.isPossibleToPause() == false) return;
        this.ref_status_btn.current.disabled = true;

        window.electron.pauseTask(this.props.task_info, (err) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('Error', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
                this.ref_status_btn.current.disabled = false;
                if(__callback) __callback();
            }else{
                
                this.setTaskStatus(common.TASK_STATUS.PAUSE, ()=>{
                    this.ref_status_btn.current.disabled = false;
                    if(__callback) __callback();
                });
            }
        });
    }

    setTaskStatus(_status, __callback){
        if(this.__mount == false) return;
        this.setState({ status : _status }, () => {
            __callback();
        });
    }

    onClickStatusBtn(is_play_btn){
        
        let cur_server_time = Index.g_server_clock.getServerTime();

        if(this.state.status == common.TASK_STATUS.READY && this.props.task_info.schedule_time > cur_server_time){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot start this task before open time.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        let new_status = is_play_btn ? common.TASK_STATUS.PLAY : common.TASK_STATUS.PAUSE;

        // status가 pause 일 때 버튼 클릭시 status를 start 상태로 만들어야함.
        // status가 pause 가 아닐때 버튼 클릭시 status를 pause로 만들어야한다.
        if(new_status == common.TASK_STATUS.PLAY){
            this.onPlayTask(this.retry_cnt_task_play);
        }else if(new_status == common.TASK_STATUS.PAUSE){
            this.onPauseTask();
        }
    }

    onClickRemoveBtn(){

        if(this.isPossibleToPause()){
            this.onPauseTask(() =>{
                this.props.h_remove(this.props.task_info._id);
            });
        }else{
            this.props.h_remove(this.props.task_info._id);
        }
    }

    getStatusBtnSrc(){

        let btn_src = '';

        switch(this.state.status){
            case common.TASK_STATUS.READY : 
                btn_src = TaskTableItem.PLAY_BTN_SRC;
                break;
            case common.TASK_STATUS.PAUSE : 
                btn_src = TaskTableItem.PLAY_BTN_SRC;
                break;
            case common.TASK_STATUS.PLAY : 
                btn_src = TaskTableItem.PAUSE_BTN_SRC;
                break;
            case common.TASK_STATUS.FAIL : 
                btn_src = TaskTableItem.PLAY_BTN_SRC;
                break;
            case common.TASK_STATUS.DONE : 
                btn_src = TaskTableItem.PLAY_BTN_SRC;
                break;
            case common.TASK_STATUS.ON_PAGE : 
                btn_src = TaskTableItem.PAUSE_BTN_SRC;
                break;
            case common.TASK_STATUS.ADD_TO_CART : 
                btn_src = TaskTableItem.PAUSE_BTN_SRC;
                break;
            case common.TASK_STATUS.TRY_TO_DRAW : 
                btn_src = TaskTableItem.PAUSE_BTN_SRC;
                break;
            case common.TASK_STATUS.TRY_DO_PAY : 
                btn_src = TaskTableItem.PAUSE_BTN_SRC;
                break;
        }

        return btn_src;
    }

    isPossibleToPlay(){
        switch(this.state.status){
            case common.TASK_STATUS.READY : 
                let cur_server_time = Index.g_server_clock.getServerTime();
                return this.props.task_info.schedule_time <= cur_server_time;
            case common.TASK_STATUS.PAUSE : 
                return true;
            case common.TASK_STATUS.PLAY : 
                return false;
            case common.TASK_STATUS.FAIL : 
                return true;
            case common.TASK_STATUS.DONE : 
                return true;
            case common.TASK_STATUS.ON_PAGE : 
                return false;
            case common.TASK_STATUS.ADD_TO_CART : 
                return false;
            case common.TASK_STATUS.TRY_TO_DRAW : 
                return false;
            case common.TASK_STATUS.TRY_DO_PAY : 
                return false;
        }
    }

    isPossibleToPause(){
        switch(this.state.status){
            case common.TASK_STATUS.READY : 
                return false;
            case common.TASK_STATUS.PAUSE : 
                return false;
            case common.TASK_STATUS.PLAY : 
                return true;
            case common.TASK_STATUS.FAIL : 
                return false;
            case common.TASK_STATUS.DONE : 
                return false;
            case common.TASK_STATUS.ON_PAGE : 
                return true;
            case common.TASK_STATUS.ADD_TO_CART : 
                return true;
            case common.TASK_STATUS.TRY_TO_DRAW : 
                return true;
            case common.TASK_STATUS.TRY_DO_PAY : 
                return true;
        }
    }

    render(){
        
        let product_info = Index.g_product_mngr.getProductInfo(this.props.task_info.product_info_id);
        let product_name = ProductManager.getProductDescName(product_info);
        let open_time_str = product_info.open_time == undefined ? '' : common.get_formatted_date_str(product_info.open_time, true);
        let schedule_time_str = this.props.task_info.schedule_time == undefined ? '' : common.get_formatted_date_str(this.props.task_info.schedule_time, true);

        let status_btn = this.getStatusBtnSrc(this.state.status);

        return(
            <tr>
                <td style={{width : this.props.type_col_width, maxWidth : this.props.type_col_width}}>
                    <span>{product_info.sell_type}</span>
                </td>
                <td style={{width : this.props.product_col_width, maxWidth : this.props.product_col_width}}>
                    <div className="cut-text" style={{width : '21vw', maxWidth : '21vw'}} title={product_name}>{product_name}</div>
                </td>
                <td style={{width : this.props.size_col_width, maxWidth : this.props.size_col_width}}>
                    <span>{this.props.task_info.size_name}</span>
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div className="cut-text" style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} title={this.props.task_info.account_email}>{this.props.task_info.account_email}</div>
                </td>
                <td style={{width : this.props.open_time_col_width, maxWidth : this.props.open_time_col_width}}>
                    <span>{open_time_str}</span>
                </td>
                <td style={{width : this.props.scheduled_time_col_width, maxWidth : this.props.scheduled_time_col_width}}>
                    <span>{schedule_time_str}</span>
                </td>
                <td style={{width : this.props.status_col_width, maxWidth : this.props.status_col_width}}>
                    <span>{this.state.status}</span>
                </td>
                <td style={{width : this.props.action_col_width, maxWidth : this.props.action_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button ref={this.ref_status_btn} type="button" className="btn btn-warning" onClick={this.onClickStatusBtn.bind(this, status_btn == TaskTableItem.PLAY_BTN_SRC)}>
                                <img src={status_btn} style={{width:24, height:24}} />
                            </button>
                        </div>
                        {/* <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" >
                                <img src="./res/img/pencil-square.svg" style={{width:24, height:24}} />
                            </button>
                        </div> */}
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" onClick={this.onClickRemoveBtn.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}