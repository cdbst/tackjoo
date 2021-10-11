
class ContentsTasks extends React.Component {

    //Type 종류
    //드로우
    //구매
    static TASK_TYPES = {
        NORMAL : 'Normal',
        DROW : 'Drow'
    }

    static getTaskTypes (){
        let types = [];
        for(let type in ContentsTasks.TASK_TYPES){
            types.push(ContentsTasks.TASK_TYPES[type]);
        }
        return types;
    }

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

        this.tasks = [];

        this.task_edit_modal_id = 'edit-task-modal'

    }

    componentDidMount(){

    }

    onClickBtnNewTask(){

        let el_modal = document.getElementById(this.task_edit_modal_id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.show();
    }

    render() {

        return (
            <div className="container-fluid">
                <TaskEditModal id={this.task_edit_modal_id}/>
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
                        {/*TODO: setThe table item {this.state.account_table_list} */}
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