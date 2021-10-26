
class ContentsTasks extends React.Component {

    //status 종류 =====
    //stop (아무 것도 안하는 상태)
    //ready (대기중인 상태로 얼마나 있다가 작업이 시작되는지 표시해야함)
    //running (돌아가고 있는 상황 - 현재 어떤 작업이 진행되고 있는세 보다 자세하게 표현되면 좋겠음.)
    //complete (물품 구매가 완료된 상태)

    //action 종류
    //멈춤 또는 진행 버튼
    //편집 버튼
    //제거 버튼


    //footer buttn
    //Quick Task : 로그인된 모든 Account에 대한 드로우, 선착순 물건에 대한 구매/예약 대기 Task를 생성한다.


    constructor(props) {
        super(props);

        this.onClickBtnNewTask = this.onClickBtnNewTask.bind(this);
        this.onCreateNewTask = this.onCreateNewTask.bind(this);
        this.tasks = [];
        this.task_edit_modal_id = 'edit-task-modal';

    }

    onClickBtnNewTask(){
        let el_modal = document.getElementById(this.task_edit_modal_id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.show();
    }

    onCreateNewTask(product_info, size_name, account_id, schedule_date){
        console.log(arguments);

        //1. TODO 스케쥴 time이 현재 시간보다 과거 시간이면 즉시 실행한다.
        //2. TODO 스케쥴 time이 open time보다 이전 시간이면 open time으로 스케쥴 타임을 조정시킨다.

        //3. TODO 아직 size 정보가 없는 product_info라면 open 이후에 size 정보를 취득할 수 있으므로,
        //open시 공개되는 size 정보와 가장 유사한 size로 구매 또는 DRAW를 신청하도록 한다.

        //4. TODO 파라메터 account_id에 해당하는 browser context를 취득하여 해당 browser context에서 구매 또는 응모를 시도해야한다.
        //그리고, login이 계속 유지 중인지 아닌지 판단할 수 있는 로직도 필요시 구현해야 한다.
        //만약 로그인 세션이 만료가 됐다면, task 수행 과정에서 다시 login을 시도하는 로직의 구현이 필요할 수 있다.

        //4-1. TODO TASK table item 추가/제거/관리 코드 작성, 사용자 TASK UI 관련 코드 작성 등.
        

        //5. TODO task object 프로토타입
        // {
        //     product_info : product_info // product info object
        //     size_name : size_name // 구매 시도할 size name
        //     account_id : account_id // 구매 시도할 account id(browser context id)
        //     schedule_date : schedule_date // Date Object 구매 시도할 date object
        //     task_cond : TYPE_OF_TASK_COND // 테스크의 현재 진행 상태
        // }

        //6. TODO TYPE_OF_TASK_COND 프로토타입
        // ready, stop, on product page, on cart page, ready to pay, complete
        // draw일경우 이미 신청된 것이라면 complete 바로 표시.
        // 각 단계 실행시 나이키 서버의 응답이 지연될 경우 재시도 간격을 얼마로 정할지 ?

    }

    render() {

        return (
            <div className="container-fluid">
                <TaskEditModal id={this.task_edit_modal_id} h_create_task={this.onCreateNewTask.bind(this)}/>
                <br/>
                <div className="row">
                    <div className="col">
                        <h3 className="contents-title">{"TEST : Tasks (3/4)"}</h3>
                    </div>
                    <div className="col">
                        {/* <a>TEST : search item interface</a> */}
                    </div>
                </div>
                <div className="table-wrapper">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Type</th>
                            <th scope="col">Product</th>
                            <th scope="col">Size</th>
                            <th scope="col">Account</th>
                            <th scope="col">Status</th>
                            <th scope="col">Open Time</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TasksTableItem/>
                    </tbody>
                </table>
                </div>
                <div className="row footer">
                    <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                        <button type="button" className="btn btn-primary btn-footer-inside">
                            <img src="./res/img/file-plus-fill.svg" style={{width:24, height:24}}/> Quick Tasks
                        </button>
                        <button type="button" className="btn btn-primary btn-footer-inside" onClick={this.onClickBtnNewTask.bind(this)}>
                            <img src="./res/img/file-plus-fill.svg" style={{width:24, height:24}} /> New Task
                        </button>
                        <button type="button" className="btn btn-warning btn-footer-inside" >
                            <img src="./res/img/door-open-fill.svg" style={{width:24, height:24}}/> Run All
                        </button>
                        <button type="button" className="btn btn-warning btn-footer-inside" >
                            <img src="./res/img/door-open-fill.svg" style={{width:24, height:24}}/> Stop All
                        </button>
                        <button type="button" className="btn btn-warning btn-footer-inside" >
                            <img src="./res/img/door-open-fill.svg" style={{width:24, height:24}}/> Remove All
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}