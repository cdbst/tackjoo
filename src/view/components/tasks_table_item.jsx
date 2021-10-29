
class TasksTableItem extends React.Component {
    constructor(props) {
        super(props);

        this.onClickRemoveBtn = this.onClickRemoveBtn.bind(this);

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
                    <span>test status</span>
                </td>
                <td >
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" >
                                <img src="./res/img/door-open-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" >
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
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