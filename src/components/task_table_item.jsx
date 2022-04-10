
class TaskTableItem extends React.Component {

    static PLAY_BTN_SRC = './res/img/play-fill.svg';
    static PAUSE_BTN_SRC = './res/img/pause-fill.svg';

    constructor(props) {
        super(props);

        this.onClickRemoveBtn = this.onClickRemoveBtn.bind(this);
        this.onClickStatusBtn = this.onClickStatusBtn.bind(this);
        this.onClickModifyBtn = this.onClickModifyBtn.bind(this);
        this.onClickModifyLinkBtn = this.onClickModifyLinkBtn.bind(this);
        this.onClickProductImg = this.onClickProductImg.bind(this);
        this.onAlamScheduledTime = this.onAlamScheduledTime.bind(this);

        this.onPlayTask = this.onPlayTask.bind(this);
        this.onPauseTask = this.onPauseTask.bind(this);
        this.setTaskStatus = this.setTaskStatus.bind(this);
        this.getStatusBtnSrc = this.getStatusBtnSrc.bind(this);
        this.getStatusFontColor = this.getStatusFontColor.bind(this);
        this.getProductDescNameFontColor = this.getProductDescNameFontColor.bind(this);

        this.isPossibleToModify = this.isPossibleToModify.bind(this);
        this.isPossibleToPlay = this.isPossibleToPlay.bind(this);
        this.isPossibleToPause = this.isPossibleToPause.bind(this);
        this.isIdleState = this.isIdleState.bind(this);

        this.onChangeSelect = this.onChangeSelect.bind(this);
        this.setSelectStatus = this.setSelectStatus.bind(this);

        this.getTaskInfo = this.getTaskInfo.bind(this);

        this.ref_status_btn = React.createRef();

        let initial_status = undefined;
        let cur_server_time = Index.g_server_clock.getServerTime();

        if((this.props.task_info.schedule_time != undefined) && this.props.task_info.schedule_time > cur_server_time){
            initial_status = common.TASK_STATUS.READY;
        }else{
            initial_status = common.TASK_STATUS.PAUSE;
        }

        this.state = {
            status : initial_status,
            selected : false
        };

        this.el_input_select = 'el-input-select-' + this.props.task_info._id;

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;

        if(this.props.task_info.schedule_time !== undefined){
            Index.g_server_clock.subscribeAlam(this.props.task_info.schedule_time, this.onAlamScheduledTime, this.props.task_info._id);
        }
    }

    componentWillUnmount(){
        if(this.props.task_info.schedule_time !== undefined){
            Index.g_server_clock.unsubscribeAlam(this.props.task_info._id);
        }
        this.onPauseTask();
        this.__mount = false;
    }

    onAlamScheduledTime(_date){      
        this.onPlayTask();
    }

    onPlayTask(){

        if(this.isPossibleToPlay() == false) return;
        this.ref_status_btn.current.disabled = true;
        
        let product_info = this.props.task_info.product_info;
        if(product_info == undefined){
            Index.g_sys_msg_q.enqueue('에러', '상품 정보를 찾을수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            this.ref_status_btn.current.disabled = false;
            return;
        }

        window.electron.playTask(this.props.task_info, product_info, Index.g_billing_info, Index.g_settings_info.settings_info, (status, size_info) =>{

            this.checked_out_size_info = size_info;

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
                Index.g_sys_msg_q.enqueue('에러', '작업을 취소하는데 실패했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
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
            Index.g_sys_msg_q.enqueue('에러', '상품 출시시간 혹은 예약시간 이전에는 작업을 시작할 수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        let new_status = is_play_btn ? common.TASK_STATUS.PLAY : common.TASK_STATUS.PAUSE;

        if(new_status == common.TASK_STATUS.PLAY){
            this.onPlayTask();
        }else if(new_status == common.TASK_STATUS.PAUSE){
            this.onPauseTask();
        }
    }

    onClickModifyBtn(){
        this.props.h_modify();
    }

    onClickModifyLinkBtn(){
        this.props.h_modify_link();
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

    onClickProductImg(){
        if(this.props.task_info.product_info === undefined) return;
        if(this.props.task_info.product_info.url === undefined || this.props.task_info.product_info.url === '') return;
        window.electron.openExternalWebPage(this.props.task_info.product_info.url);
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

    getProductDescNameFontColor(){
        if(this.props.task_info.product_info.sell_type === common.SELL_TYPE.draw){
            return '#ffc107'// Yellow
        }else if(this.props.task_info.product_info.sell_type === common.SELL_TYPE.ftfs){
            return '#0dcaf0'// Blue
        }else if(this.props.task_info.product_info.sell_type === common.SELL_TYPE.notify){
            return '#9575cd'; // purple
        }else if(this.props.task_info.product_info.sell_type === common.SELL_TYPE.custom){
            return '#dc3545'// Red
        }else{
            return '#ffffff'// White
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

    isPossibleToModify(){
        if(this.state.status == common.TASK_STATUS.READY){
            return true;
        }else if(this.isPossibleToPlay()){
            return true;
        }else{
            return false;
        }
    }

    getTaskInfo(){
        return this.props.task_info;
    }

    isPossibleToPlay(){
        switch(this.state.status){
            case common.TASK_STATUS.READY : 
                const cur_server_time = Index.g_server_clock.getServerTime();
                const task_info = this.props.task_info;
                if(task_info.product_info.open_time !== undefined){
                    return task_info.product_info.open_time <= cur_server_time && task_info.schedule_time <= cur_server_time;
                }else{
                    return task_info.schedule_time <= cur_server_time;
                }
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
            case common.TASK_STATUS.IN_TO_CART : 
                return false;
            case common.TASK_STATUS.PREPARE_ORDER : 
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
            case common.TASK_STATUS.WAITING_FOR_RELEASE:
                return false;
        }
    }

    isPossibleToPause(){

        if(this.state.status == common.TASK_STATUS.READY) return false;
        else return !this.isPossibleToPlay();
    }

    isIdleState(){
        const idle_status_list = [common.TASK_STATUS.DONE, common.TASK_STATUS.FAIL, common.TASK_STATUS.PAUSE, common.TASK_STATUS.READY];
        return idle_status_list.includes(this.state.status);
    }

    onChangeSelect(){
        const is_selected = document.getElementById(this.el_input_select).checked;
        this.setState({ selected: is_selected});
        this.props.h_select_changed(this.props.task_info._id, is_selected);
    }

    setSelectStatus(value){
        document.getElementById(this.el_input_select).checked = value;
        this.setState({ selected: value});
        this.props.h_select_changed(this.props.task_info._id, value);
    }

    render(){
        
        const product_info = this.props.task_info.product_info;

        const product_name = ProductManager.getProductDescName(product_info);
        const product_name_font_color = this.getProductDescNameFontColor();

        const open_time_str = product_info.open_time == undefined ? '' : common.get_formatted_date_str(product_info.open_time, true);
        const schedule_time_str = this.props.task_info.schedule_time == undefined ? '' : common.get_formatted_date_str(this.props.task_info.schedule_time, true);
        const display_size_name = this.props.task_info.friendly_size_name == undefined ?  this.props.task_info.size_name : this.props.task_info.friendly_size_name;

        const status_btn = this.getStatusBtnSrc(this.state.status);
        const status_text_color = this.getStatusFontColor(this.state.status);

        const proxy_alias = this.props.task_info.proxy_info == undefined ? '' : this.props.task_info.proxy_info.alias;
        const proxy_ip = this.props.task_info.proxy_info == undefined ? '' : this.props.task_info.proxy_info.ip;

        const status_text = this.state.status === common.TASK_STATUS.DONE ? `${this.state.status}(${this.checked_out_size_info.name})` : this.state.status;

        const background_color = this.state.selected ? 'rgb(131, 241, 149, 0.36)' : 'transparent';

        const status_btn_title = status_btn === TaskTableItem.PLAY_BTN_SRC ? '시작하기' : '정지하기';

        return(
            <tr style={{background : background_color}}>
                <td style={{width : this.props.image_col_width, maxWidth : this.props.image_col_width}}>
                    <img 
                        className="rounded product-table-item-img" 
                        src={product_info.img_url} 
                        alt={product_info.name}
                        style={{cursor: 'pointer'}}
                        onClick={this.onClickProductImg.bind(this)}
                    />
                </td>
                <td style={{width : this.props.product_col_width, maxWidth : this.props.product_col_width}}>
                    <div 
                        className="cut-text custom-color-text-light" 
                        style={{width : '21vw', maxWidth : '21vw', '--text-color' : product_name_font_color}} 
                        title={product_name}> {product_name}
                    </div>
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
                    <span className='custom-color-text' style={{'--text-color' : status_text_color}}>{status_text}</span>
                </td>
                <td style={{width : this.props.action_col_width, maxWidth : this.props.action_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title={status_btn_title}>
                            <button ref={this.ref_status_btn} type="button" className="btn btn-warning" onClick={this.onClickStatusBtn.bind(this, status_btn == TaskTableItem.PLAY_BTN_SRC)}>
                                <img src={status_btn} style={{width:24, height:24}} />
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="[좌클릭 : 편집하기], [우클릭: 링크로 편집하기]">
                            <button type="button" className="btn btn-info" onClick={this.onClickModifyBtn.bind(this)} onContextMenu={this.onClickModifyLinkBtn.bind(this)}>
                                <img src="./res/img/pencil-square.svg" style={{width:24, height:24}} />
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="제거하기">
                            <button type="button" className="btn btn-danger" onClick={this.onClickRemoveBtn.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
                <td style={{width : this.props.select_col_width, maxWidth : this.props.select_col_width}} >
                    <div className="form-switch">
                        <input id={this.el_input_select} type="checkbox" className="form-check-input" onChange={this.onChangeSelect.bind(this)}/>
                    </div>
                </td>
            </tr>
        );
    }
}