
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
        this.onClickBtnRunAll = this.onClickBtnRunAll.bind(this);
        this.onClickBtnRemoveAll = this.onClickBtnRemoveAll.bind(this);

        this.onCreateNewTask = this.onCreateNewTask.bind(this);
        this.onRemoveTask = this.onRemoveTask.bind(this);
        this.__genTasksTableItems = this.__genTasksTableItems.bind(this);
        this.__updateTaskTalbeItems = this.__updateTaskTalbeItems.bind(this);
        this.__checkTaskDuplicated = this.__checkTaskDuplicated.bind(this);
        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);

        this.task_list = [];
        this.table_item_refs = [];
        this.task_edit_modal_id = 'edit-task-modal';

        this.state = {
            task_table_items : []
        };

        this.__setupColumnsWidth();
    }

    __setupColumnsWidth(){
        this.type_col_width = 124.5;
        this.size_col_width = 53;
        this.account_col_width = 240;
        this.open_time_col_width = 180;
        this.scheduled_time_col_width = 180;
        this.status_col_width = 180;
        this.action_col_width = 145.5;

        let cols_width_without_product_col = this.type_col_width + 
            this.size_col_width + 
            this.account_col_width + 
            this.open_time_col_width + 
            this.scheduled_time_col_width + 
            this.status_col_width +
            this.action_col_width;

        this.product_col_width = 'calc( 100% - ' + cols_width_without_product_col + 'px)';
    }

    onClickBtnRemoveAll(){
        Index.g_prompt_modal.popModal('Remove All Task Items', 'Are you sure want to remove all of task items?', (is_ok)=>{
            if(is_ok == false) return;

            let paused_remain = this.table_item_refs.length;

            this.table_item_refs.forEach((table_item_ref) =>{
                table_item_ref.current.onPauseTask(()=>{
                    if(--paused_remain == 0){
                        this.task_list = [];
                        this.__updateTaskTalbeItems();
                    }
                });
            });
        });
    }

    onClickBtnRunAll(){
        this.table_item_refs.forEach((table_item_ref) =>{
            table_item_ref.current.onPlayTask();
        });
    }

    onClickBtnStopAll(){
        this.table_item_refs.forEach((table_item_ref) =>{
            table_item_ref.current.onPauseTask();
        });
    }

    onClickBtnNewTask(){
        let el_modal = document.getElementById(this.task_edit_modal_id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.show();
    }

    onCreateNewTask(product_info, size_name, account_id, account_email, schedule_time){
    
        if(schedule_time != undefined){
        
            //스케쥴 time이 open time보다 이전 시간이면 open time으로 스케쥴 타임을 조정시킨다.
            if(product_info.open_time != undefined && product_info.open_time > schedule_time){
                schedule_time = product_info.open_time;
            }
    
            //2-1 TODO 스케쥴 time이 end time보다 미래의 시간이라면 작업을 수행할 수 없기 때문에 스케쥴 time을 open time으로 변경한다.
            if(product_info.end_time != undefined && product_info.end_time < schedule_time){
                schedule_time = product_info.open_time;
            }
        }
        
        //3. TODO 아직 size 정보가 없는 product_info라면 open 이후에 size 정보를 취득할 수 있으므로,
        //open시 공개되는 size 정보와 가장 유사한 size로 구매 또는 DRAW를 신청하도록 한다.

        //4. TODO 파라메터 account_id에 해당하는 browser context를 취득하여 해당 browser context에서 구매 또는 응모를 시도해야한다.
        //그리고, login이 계속 유지 중인지 아닌지 판단할 수 있는 로직도 필요시 구현해야 한다.
        //만약 로그인 세션이 만료가 됐다면, task 수행 과정에서 다시 login을 시도하는 로직의 구현이 필요할 수 있다.

        //4-1. TODO TASK table item 추가/제거/관리 코드 작성, 사용자 TASK UI 관련 코드 작성 등.

        let task_info_obj = common.get_task_info_obj_scheme();
        common.update_task_info_obj(task_info_obj, 'product_info_id', product_info._id);
        common.update_task_info_obj(task_info_obj, 'size_name', size_name);
        common.update_task_info_obj(task_info_obj, 'account_email', account_email);
        common.update_task_info_obj(task_info_obj, 'account_id', account_id);
        common.update_task_info_obj(task_info_obj, 'schedule_time', schedule_time);
        common.update_task_info_obj(task_info_obj, '_id', common.uuidv4());
        common.update_task_info_obj(task_info_obj, 'retry_cnt', Index.g_app_config.MAX_RETRY_COUNT_TASK);

    
        if(this.__checkTaskDuplicated(task_info_obj)){
            Index.g_sys_msg_q.enqueue('Error', 'Cannot create duplicated task', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 4000);
            return;
        }
        this.task_list.push(task_info_obj);

        this.__updateTaskTalbeItems();
    }

    __checkTaskDuplicated(task_info_to_check){

        let task_info_to_check_product_info = Index.g_product_mngr.getProductInfo(task_info_to_check.product_info_id);

        let duplicated = this.task_list.filter((task_info) =>{
            if(task_info.account_id != task_info_to_check.account_id) return false;

            let task_info_product_info = Index.g_product_mngr.getProductInfo(task_info.product_info_id);
            if(task_info_to_check_product_info.sell_type == common.SELL_TYPE.draw && task_info_product_info._id == task_info_to_check_product_info._id) return true;
            else return false;
        });

        return duplicated.length != 0;
    }

    onRemoveTask(task_id){
        for(var i = 0; i < this.task_list.length; i++){
            if(this.task_list[i]._id == task_id){
                this.task_list.splice(i, 1);
                break;
            }
        }

        this.__updateTaskTalbeItems();
    }

    __updateTaskTalbeItems(){
        let el_task_table_items = this.__genTasksTableItems(this.task_list);
        
        this.setState(_ => ({
            task_table_items : el_task_table_items
        }));
    }

    __genTasksTableItems(task_list){

        let task_table_items = [];
        this.table_item_refs = [];

        for(var i = 0; i < task_list.length; i++){
            let task_info = task_list[i];
            let task_ref = React.createRef();
            this.table_item_refs.push(task_ref);
            task_table_items.push(
                <TaskTableItem 
                    key={task_info._id} 
                    id={task_info._id}
                    h_remove={this.onRemoveTask.bind(this)}
                    task_info={task_info}
                    ref={task_ref}
                    type_col_width={this.type_col_width}
                    product_col_width={this.product_col_width}
                    size_col_width={this.size_col_width}
                    account_col_width={this.account_col_width}
                    open_time_col_width={this.open_time_col_width}
                    scheduled_time_col_width={this.scheduled_time_col_width}
                    status_col_width={this.status_col_width}
                    action_col_width={this.action_col_width}
                />
            );
        }

        return task_table_items;
    }

    render() {


        return (
            <div className="container-fluid">
                <TaskEditModal id={this.task_edit_modal_id} h_create_task={this.onCreateNewTask.bind(this)}/>
                <br/>
                <div className="row">
                    <div className="col">
                        <h4 className="contents-title">{"Tasks (" + this.task_list.length +")"}</h4>
                    </div>
                    <div className="col">
                        {/* <a>TEST : search item interface</a> */}
                    </div>
                </div>
                <div className="table-wrapper">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col" style={{width : this.type_col_width, maxWidth : this.type_col_width}}>Type</th>
                            <th scope="col" style={{width : this.product_col_width, maxWidth : this.product_col_width}}>Product</th>
                            <th scope="col" style={{width : this.size_col_width, maxWidth : this.size_col_width}}>Size</th>
                            <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>Account</th>
                            <th scope="col" style={{width : this.open_time_col_width, maxWidth : this.open_time_col_width}}>Open Time</th>
                            <th scope="col" style={{width : this.scheduled_time_col_width, maxWidth : this.scheduled_time_col_width}}>Scheduled Time</th>
                            <th scope="col" style={{width : this.status_col_width, maxWidth : this.status_col_width}}>Status</th>
                            <th scope="col" style={{width : this.action_col_width, maxWidth : this.action_col_width}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.task_table_items}
                    </tbody>
                </table>
                </div>
                <div className="row footer">
                    <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                        <button type="button" className="btn btn-primary btn-footer-inside">
                            <img src="./res/img/lightning-fill.svg" style={{width:24, height:24}}/> Quick Tasks
                        </button>
                        <button type="button" className="btn btn-primary btn-footer-inside" onClick={this.onClickBtnNewTask.bind(this)}>
                            <img src="./res/img/file-earmark-plus-fill.svg" style={{width:24, height:24}} /> New Task
                        </button>
                        <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickBtnRunAll.bind(this)}>
                            <img src="./res/img/play-circle-fill.svg" style={{width:24, height:24}} /> Run All
                        </button>
                        <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickBtnStopAll.bind(this)}>
                            <img src="./res/img/pause-circle-fill.svg" style={{width:24, height:24}}/> Pause All
                        </button>
                        <button type="button" className="btn btn-danger btn-footer-inside" onClick={this.onClickBtnRemoveAll.bind(this)}>
                            <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/> Remove All
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}