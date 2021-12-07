
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
        this.getStatusFontColor = this.getStatusFontColor.bind(this);

        this.isPossibleToPlay = this.isPossibleToPlay.bind(this);
        this.isPossibleToPause = this.isPossibleToPause.bind(this);

        this.ref_status_btn = React.createRef();

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

        this.__mount = false;
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
        this.onPlayTask();
    }

    onPlayTask(){

        if(this.isPossibleToPlay() == false) return;
        this.ref_status_btn.current.disabled = true;
        
        let product_info = Index.g_product_mngr.getProductInfo(this.props.task_info.product_info_id);
        if(product_info == undefined){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot found product information', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            this.ref_status_btn.current.disabled = false;
            return;
        }

        window.electron.playTask(this.props.task_info, product_info, Index.g_billing_info, Index.g_settings_info.settings_info, (status) =>{

            this.setTaskStatus(status, ()=>{
                this.ref_status_btn.current.disabled = false;
            });
        });
    }

    onPauseTask(__callback){

        if(this.isPossibleToPause() == false){
            if(__callback)__callback();
            return;
        } 
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

        if(this.state.status == common.TASK_STATUS.READY && this.isPossibleToPlay() == false){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot start this task before open time.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        let new_status = is_play_btn ? common.TASK_STATUS.PLAY : common.TASK_STATUS.PAUSE;

        if(new_status == common.TASK_STATUS.PLAY){
            this.onPlayTask();
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

    getStatusFontColor(){

        if(this.state.status == common.TASK_STATUS.DONE){
            return '#0dcaf0'; //blue
        }else if(this.state.status == common.TASK_STATUS.FAIL){
            return '#dc3545'; //red
        }else if(this.state.status == common.TASK_STATUS.READY){
            return '#ffc107'; //yellow
        }else if(this.state.status == common.TASK_STATUS.PAUSE){
            return '#dc3545'; //red
        }else if(this.state.status == common.TASK_STATUS.TRY_TO_RETRY){
            return '#dc3545'; //red
        }else if(this.isPossibleToPlay()){
            return '#ffffff'; //white
        }else{
            return '#83f195'; //green
        }
    }

    getStatusBtnSrc(){

        if(this.state.status == common.TASK_STATUS.READY){
            return TaskTableItem.PLAY_BTN_SRC;
        }else if(this.isPossibleToPlay()){
            return TaskTableItem.PLAY_BTN_SRC;
        }else{
            return TaskTableItem.PAUSE_BTN_SRC;
        }
    }

    isPossibleToPlay(){
        switch(this.state.status){
            case common.TASK_STATUS.READY : 
                const cur_server_time = Index.g_server_clock.getServerTime();
                const product_info = Index.g_product_mngr.getProductInfo(this.props.task_info.product_info_id);
                return product_info.open_time <= cur_server_time;
            case common.TASK_STATUS.PAUSE : 
                return true;
            case common.TASK_STATUS.PLAY : 
                return false;
            case common.TASK_STATUS.FAIL : 
                return true;
            case common.TASK_STATUS.DONE : 
                return true;
            case common.TASK_STATUS.TRY_TO_LOGIN :
                return false;
            case common.TASK_STATUS.ON_PAGE : 
                return false;
            case common.TASK_STATUS.ADD_TO_CART : 
                return false;
            case common.TASK_STATUS.TRY_TO_DRAW : 
                return false;
            case common.TASK_STATUS.TRY_TO_PAY : 
                return false;
            case common.TASK_STATUS.READY_TO_PAY :
                return false;
            case common.TASK_STATUS.GET_PRODUCT_INFO :
                return false;
            case common.TASK_STATUS.WAITING_FOR_OTHER_TASK:
                return false;
        }
    }

    isPossibleToPause(){

        if(this.state.status == common.TASK_STATUS.READY) return false;
        else return !this.isPossibleToPlay();
    }

    render(){
        
        let product_info = Index.g_product_mngr.getProductInfo(this.props.task_info.product_info_id);
        let product_name = ProductManager.getProductDescName(product_info);
        let open_time_str = product_info.open_time == undefined ? '' : common.get_formatted_date_str(product_info.open_time, true);
        let schedule_time_str = this.props.task_info.schedule_time == undefined ? '' : common.get_formatted_date_str(this.props.task_info.schedule_time, true);
        let display_size_name = this.props.task_info.friendly_size_name == undefined ?  this.props.task_info.size_name : this.props.task_info.friendly_size_name;

        let status_btn = this.getStatusBtnSrc(this.state.status);
        let status_text_color = this.getStatusFontColor(this.state.status);

        const proxy_alias = this.props.task_info.proxy_info == undefined ? '' : this.props.task_info.proxy_info.alias;
        const proxy_ip = this.props.task_info.proxy_info == undefined ? '' : this.props.task_info.proxy_info.ip;

        return(
            <tr>
                <td style={{width : this.props.type_col_width, maxWidth : this.props.type_col_width}}>
                    <span>{product_info.sell_type}</span>
                </td>
                <td style={{width : this.props.product_col_width, maxWidth : this.props.product_col_width}}>
                    <div className="cut-text" style={{width : '21vw', maxWidth : '21vw'}} title={product_name}>{product_name}</div>
                </td>
                <td style={{width : this.props.size_col_width, maxWidth : this.props.size_col_width}}>
                    <span>{display_size_name}</span>
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div className="cut-text" style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} title={this.props.task_info.account_email}>{this.props.task_info.account_email}</div>
                </td>
                <td style={{width : this.props.proxy_col_width, maxWidth : this.props.proxy_col_width}}>
                    <div className="cut-text" style={{width : this.props.proxy_col_width, maxWidth : this.props.proxy_col_width}} title={proxy_alias}>{proxy_ip}</div>
                </td>
                <td style={{width : this.props.open_time_col_width, maxWidth : this.props.open_time_col_width}}>
                    <span>{open_time_str}</span>
                </td>
                <td style={{width : this.props.scheduled_time_col_width, maxWidth : this.props.scheduled_time_col_width}}>
                    <span>{schedule_time_str}</span>
                </td>
                <td style={{width : this.props.status_col_width, maxWidth : this.props.status_col_width}} >
                    <span className='task-status-text' style={{'--text-color' : status_text_color}}>{this.state.status}</span>
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