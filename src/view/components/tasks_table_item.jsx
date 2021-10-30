
class TasksTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickRemoveBtn = this.onClickRemoveBtn.bind(this);
        this.onClickStatusBtn = this.onClickStatusBtn.bind(this);
        this.onAlamScheduledTime = this.onAlamScheduledTime.bind(this);

        // <this.props.task_info data example>
        // let task_obj = {
        //     product_info : product_info,
        //     size_name : size_name,
        //     account_email : account_email,
        //     account_id : account_id,
        //     schedule_date : schedule_date,
        //     _id : common.uuidv4()
        // };


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

        Index.g_server_clock.subscribeAlam(this.props.task_info.schedule_time, this.onAlamScheduledTime);
    }

    onAlamScheduledTime(date){

        console.log('ALAM ON!!!');

        this.setState(_ => ({
            status : common.TASK_STATUS.PLAY
        }));
    }

    onClickStatusBtn(){
        //TODO 아직 open time이 전이라 play 할 수 없는 상태인 ready status에 대한 처리가 필요함 (open 이전에 play하려고 했을 때 처리.)
        let cur_server_time = Index.g_server_clock.getServerTime();
        
        if(this.state.status == common.TASK_STATUS.READY && this.props.task_info.schedule_time > cur_server_time){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot start this task before open time.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
            return;
        }

        let new_status = this.state.status != common.TASK_STATUS.PLAY ? common.TASK_STATUS.PLAY : common.TASK_STATUS.PAUSE;
        this.setState(_ => ({
            status : new_status
        }));
    }

    onClickRemoveBtn(){
        this.props.h_remove(this.props.task_info._id);
    }

    // TODO EDIT 버튼과 그에 따른 기능 구현.
    // TODO Run Pause 버튼과 그에 따른 기능 구현.

    // 엑션 종류 : 편집, 시작/멈춤, 제거, 예약

    render(){

        let product_name = Index.g_product_mngr.getProductDescName(this.props.task_info.product_info);
        let open_time_str = this.props.task_info.product_info.open_time == undefined ? '' : common.get_formatted_date_str(this.props.task_info.product_info.open_time, true);
        let schedule_time_str = this.props.task_info.schedule_time == undefined ? '' : common.get_formatted_date_str(this.props.task_info.schedule_time, true);

        let status_btn = this.state.status != common.TASK_STATUS.PLAY ? './res/img/play-fill.svg' : './res/img/pause-fill.svg'

        // TODO product name이 너무 길면 적당한 길이로 표현해주도록 처리해야 함.
        // TODO 각 cell의 고정된 너비(또는 비율)를 적용해야 함.
        return(
            <tr>
                <td >
                    <span>{this.props.task_info.product_info.sell_type}</span>
                </td>
                <td >
                    <span>{product_name}</span>
                </td>
                <td >
                    <span>{this.props.task_info.size_name}</span>
                </td>
                <td >
                    <span>{this.props.task_info.account_email}</span>
                </td>
                <td >
                    <span>{open_time_str}</span>
                </td>
                <td >
                    <span>{schedule_time_str}</span>
                </td>
                <td >
                    <span>{this.state.status}</span>
                </td>
                <td >
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" >
                                <img src={status_btn} style={{width:24, height:24}} onClick={this.onClickStatusBtn.bind(this)}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" >
                                <img src="./res/img/pencil-square.svg" style={{width:24, height:24}} />
                            </button>
                        </div>
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