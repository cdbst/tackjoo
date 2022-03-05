
class ContentsTasks extends React.Component {

    constructor(props) {
        super(props);

        this.onClickBtnNewTask = this.onClickBtnNewTask.bind(this);
        this.onClickBtnRunAll = this.onClickBtnRunAll.bind(this);
        this.onClickBtnRemoveAll = this.onClickBtnRemoveAll.bind(this);
        this.onClickBtnProductListReload = this.onClickBtnProductListReload.bind(this);

        this.onCreateNewTask = this.onCreateNewTask.bind(this);
        this.onLoadLinkProduct = this.onLoadLinkProduct.bind(this);
        this.onRemoveTask = this.onRemoveTask.bind(this);
        this.__getTaskTableElement = this.__getTaskTableElement.bind(this);
        this.__checkTaskDuplicated = this.__checkTaskDuplicated.bind(this);
        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.__adjectScheduleTime = this.__adjectScheduleTime.bind(this);
        this.__createNewTask = this.__createNewTask.bind(this);
        this.__push_task_table_item = this.__push_task_table_item.bind(this);
        this.create_quick_task = this.create_quick_task.bind(this);

        this.__get_appropreate_to_tasking_account_emails = this.__get_appropreate_to_tasking_account_emails.bind(this);
        this.__get_appropreate_to_tasking_proxy_infos = this.__get_appropreate_to_tasking_proxy_infos.bind(this);

        this.task_edit_modal_id = 'edit-task-modal';
        this.load_link_product_modal_id = 'load-link-product-modal';

        this.__ref_product_list_reload_btn = React.createRef();

        this.__table_item_ref_dict = {};
        this.state = {
            task_table_item_list : []
        };

        this.__setupColumnsWidth();
    }

    __setupColumnsWidth(){
        this.image_col_width = 70;
        this.size_col_width = 65;
        this.account_col_width = 210;
        this.proxy_col_width = 140;
        this.open_time_col_width = 190;
        this.scheduled_time_col_width = 190;
        this.status_col_width = 220;
        this.action_col_width = 145.5;

        let cols_width_without_product_col = this.image_col_width + 
            this.size_col_width + 
            this.account_col_width + 
            this.open_time_col_width + 
            this.scheduled_time_col_width + 
            this.status_col_width +
            this.action_col_width;

        this.product_col_width = 'calc( 100% - ' + cols_width_without_product_col + 'px)';
    }

    onClickBtnProductListReload(){

        this.__ref_product_list_reload_btn.current.setLoadingStatus(true);

        Index.g_product_mngr.loadProductInfoList(()=>{
            this.__ref_product_list_reload_btn.current.setLoadingStatus(false);
        });
    }

    onClickBtnRemoveAll(){
        Index.g_prompt_modal.popModal('경고', <p>모든 작업을 삭제하시겠습니까?</p>, (is_ok)=>{
            if(is_ok == false) return;
            this.__table_item_ref_dict = {};
            this.setState({ task_table_item_list: []});
        });
    }

    onClickBtnRunAll(){
        for(const [, table_item_ref] of Object.entries(this.__table_item_ref_dict)){
            table_item_ref.current.onPlayTask();
        }
    }

    onClickBtnStopAll(){
        for(const [, table_item_ref] of Object.entries(this.__table_item_ref_dict)){
            table_item_ref.current.onPauseTask();
        }
    }

    onClickBtnNewTask(product_link_url){

        let el_modal = document.getElementById(this.task_edit_modal_id);
        el_modal.product_link_url = product_link_url;

        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.show();
    }

    __adjectScheduleTime(product_info, schedule_time){
        //스케쥴 time이 open time보다 이전 시간이면 open time으로 스케쥴 타임을 조정시킨다.
        if(product_info.open_time != undefined && product_info.open_time > schedule_time){
            schedule_time = product_info.open_time;
        }

        //스케쥴 time이 end time보다 미래의 시간이라면 작업을 수행할 수 없기 때문에 스케쥴 time을 open time으로 변경한다.
        if(product_info.end_time != undefined && product_info.end_time < schedule_time){
            schedule_time = product_info.open_time;
        }

        return schedule_time;
    }

    onCreateNewTask(product_info, friendly_size_name_list, account_email_list, schedule_time, proxy_info_list, watchdog){

        const err_message = ContentsBilling.isValidBillingInfo(Index.g_billing_info);
        if(err_message !== undefined){
            Index.g_sys_msg_q.enqueue('에러', `작업을 생성하려면 [결제관리] 탭에서 결제 정보를 저장해야 합니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 10000);
            return;
        }

        for(var i = 0; i < account_email_list.length; i++){
            const friendly_size_name = friendly_size_name_list[common.get_random_int(0, friendly_size_name_list.length - 1)];

            let cur_proxy_info = undefined;
            if(proxy_info_list.length !== 0){
                cur_proxy_info = proxy_info_list[i % proxy_info_list.length];
            }

            this.__createNewTask(product_info, friendly_size_name, account_email_list[i], schedule_time, cur_proxy_info, watchdog);
        }
    }

    onLoadLinkProduct(product_link_url){
        this.onClickBtnNewTask(product_link_url);
    }

    __createNewTask(product_info, friendly_size_name, account_email, schedule_time, proxy_info, watchdog){

        window.electron.getAccountIDbyEmail(account_email, (err, account_id) =>{
            if(err){
                Index.g_sys_msg_q.enqueue('에러', '작업을 등록하는 과정에서 계정 정보를 찾을 수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 4000);
                return;
            }

            if(schedule_time != undefined) schedule_time = this.__adjectScheduleTime(product_info, schedule_time);

            let task_info_obj = common.get_task_info_obj_scheme();
            const size_name = ProductManager.get_size_name_by_friendly_size_name(product_info, friendly_size_name);

            common.update_task_info_obj(task_info_obj, 'product_info', product_info);
            common.update_task_info_obj(task_info_obj, 'size_name', size_name);
            common.update_task_info_obj(task_info_obj, 'friendly_size_name', friendly_size_name);
            common.update_task_info_obj(task_info_obj, 'account_email', account_email);
            common.update_task_info_obj(task_info_obj, 'account_id', account_id);
            common.update_task_info_obj(task_info_obj, 'schedule_time', schedule_time);
            common.update_task_info_obj(task_info_obj, 'proxy_info', proxy_info);
            common.update_task_info_obj(task_info_obj, 'watchdog', watchdog);
            common.update_task_info_obj(task_info_obj, '_id', common.uuidv4());

            if(this.__checkTaskDuplicated(task_info_obj)){
                Index.g_sys_msg_q.enqueue('에러', `중복된 작업은 생성할 수 없습니다. ${product_info.name}(${account_email})`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
                return;
            }

            this.__push_task_table_item(task_info_obj);
        });
    }

    __push_task_table_item(task_info){
        const task_table_item_ref = React.createRef();
        const task_table_item = this.__getTaskTableElement(task_info, task_table_item_ref);

        this.state.task_table_item_list.push(task_table_item);
        this.__table_item_ref_dict[task_info._id] = task_table_item_ref;

        this.setState({
            task_table_item_list: this.state.task_table_item_list
        });        
    }

    __checkTaskDuplicated(task_info_to_check){
        
        let duplicated = this.state.task_table_item_list.filter((task_table_item) =>{

            const task_info = task_table_item.props.task_info;
            if(task_info.account_id !== task_info_to_check.account_id) return false;

            if(task_info_to_check.product_info.sell_type === common.SELL_TYPE.draw && task_info.product_info._id === task_info_to_check.product_info._id) return true;
            else return false;
        });

        return duplicated.length !== 0;
    }

    onRemoveTask(task_id){
        const task_table_item_list = this.state.task_table_item_list.filter((task_table_item) => {
            return task_table_item.key != task_id;
        });

        delete this.__table_item_ref_dict[task_id];
        this.setState({
            task_table_item_list: task_table_item_list
        });
    }

    __getTaskTableElement(task_info, task_ref){
        return (
            <TaskTableItem
                key={task_info._id} 
                id={task_info._id}
                h_remove={this.onRemoveTask.bind(this)}
                task_info={task_info}
                ref={task_ref}
                image_col_width={this.image_col_width}
                product_col_width={this.product_col_width}
                size_col_width={this.size_col_width}
                account_col_width={this.account_col_width}
                proxy_col_width={this.proxy_col_width}
                open_time_col_width={this.open_time_col_width}
                scheduled_time_col_width={this.scheduled_time_col_width}
                status_col_width={this.status_col_width}
                action_col_width={this.action_col_width}
            />
        );
    }

    __get_appropreate_to_tasking_account_emails(__callback){

        window.electron.getAccountInfo( (err, __account_info_list) => {

            if(__account_info_list.length === 0){
                __callback([]);
                return;
            }

            // 첫번째로 아예 task로 등록되지 않은 계정부터 찾는다.
            const account_status_dict = {};
            __account_info_list.accounts.forEach((account_info)=>{
                account_status_dict[account_info.email] = 0;
            });

            for(const task_ref of Object.values(this.__table_item_ref_dict)){
                const task_account_email = task_ref.current.props.task_info.account_email;
                if(task_ref.current.isIdleState()){
                    account_status_dict[task_account_email] = Math.max(account_status_dict[task_account_email], 1);
                }else{
                    account_status_dict[task_account_email] = Math.max(account_status_dict[task_account_email], 2);
                }
            }

            // 두번째로, idle 한 것부터 찾는다.
            const unregistred_account_emails = [];
            const idle_account_emails = [];
            const busy_account_emails = [];

            for(const [account_email, status] of Object.entries(account_status_dict)){
                if(status === 0){
                    unregistred_account_emails.push(account_email);
                }else if(status === 1){
                    idle_account_emails.push(account_email);
                }else{
                    busy_account_emails.push(account_email);
                }
            }

            if(unregistred_account_emails.length > 0){
                __callback(unregistred_account_emails);
            }else if(idle_account_emails.length > 0){
                __callback(idle_account_emails);
            }else{
                __callback(busy_account_emails);
            }
        });
    }

    __get_appropreate_to_tasking_proxy_infos(__callback){

        window.electron.loadProxyInfo( (err, proxy_info_list) => {

            if(proxy_info_list.length === 0){
                __callback([]);
                return;
            }

            // 첫번째로 아예 task로 등록되지 않은 계정부터 찾는다.
            const proxy_status_dict = {};
            proxy_info_list.forEach((proxy_info)=>{
                proxy_status_dict[proxy_info._id] = {
                    proxy_info : proxy_info,
                    status : 0,
                }
            });

            for(const task_ref of Object.values(this.__table_item_ref_dict)){

                const proxy_info = task_ref.current.props.task_info.proxy_info;
                if(proxy_info === undefined) continue;

                if(task_ref.current.isIdleState()){
                    proxy_status_dict[proxy_info._id].status = Math.max(proxy_status_dict[proxy_info._id].status, 1);
                }else{
                    proxy_status_dict[proxy_info._id].status = Math.max(proxy_status_dict[proxy_info._id].status, 2);
                }
            }

            const unregistred_proxy_infos = [];
            const idle_proxy_infos = [];
            const busy_proxy_infos = [];

            for(const data of Object.values(proxy_status_dict)){
                if(data.status === 0){
                    unregistred_proxy_infos.push(data.proxy_info);
                }else if(data.status === 1){
                    idle_proxy_infos.push(data.proxy_info);
                }else{
                    busy_proxy_infos.push(data.proxy_info);
                }
            }

            if(unregistred_proxy_infos.length > 0){
                __callback(unregistred_proxy_infos);
            }else if(idle_proxy_infos.length > 0){
                __callback(idle_proxy_infos);
            }else{
                __callback(busy_proxy_infos);
            }
        });
    }

    create_quick_task(product_info){

        this.__get_appropreate_to_tasking_account_emails((account_emails)=>{
            
            if(account_emails.length === 0){
                Index.g_sys_msg_q.enqueue('에러', '작업을 하기위한 계정이 하나도 존재하지 않습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }
            
            const account_email = account_emails[common.get_random_int(0, account_emails.length - 1)];
            const friendly_size_name = '무작위';
            const schedule_time = Index.g_server_clock.getServerTime();

            Index.g_sys_msg_q.enqueue('빠른 작업 생성 안내', `${account_email} 계정으로 '${product_info.name}' 상품 1개를 즉시 구매합니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            if(Index.g_settings_info.settings_info.new_product_create_task_use_proxy === 1){
                this.__get_appropreate_to_tasking_proxy_infos((proxy_infos)=>{

                    let proxy_info = undefined;

                    if(proxy_infos.length > 0){
                        proxy_info = proxy_infos[common.get_random_int(0, proxy_infos.length - 1)];
                    }

                    this.__createNewTask(product_info, friendly_size_name, account_email, schedule_time, proxy_info, false);

                });
            }else{
                this.__createNewTask(product_info, friendly_size_name, account_email, schedule_time, undefined, false);
            }

        });
    }

    render() {
        return (
            <div className="tab-pane fade show active" id="tasks" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.TASKS}>
                <div className="container-fluid">
                    <TaskEditModal id={this.task_edit_modal_id} h_create_task={this.onCreateNewTask.bind(this)}/>
                    <LoadLinkProductModal id={this.load_link_product_modal_id} h_load_product={this.onLoadLinkProduct.bind(this)}/>
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">{"작업 (" + this.state.task_table_item_list.length +")"}</h4>
                        </div>
                        <div className="col">
                            {/* <a>TEST : search item interface</a> */}
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.image_col_width, maxWidth : this.image_col_width}}>이미지</th>
                                <th scope="col" style={{width : this.product_col_width, maxWidth : this.product_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.size_col_width, maxWidth : this.size_col_width}}>사이즈</th>
                                <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>계정</th>
                                <th scope="col" style={{width : this.proxy_col_width, maxWidth : this.proxy_col_width}}>프록시</th>
                                <th scope="col" style={{width : this.open_time_col_width, maxWidth : this.open_time_col_width}}>판매일정</th>
                                <th scope="col" style={{width : this.scheduled_time_col_width, maxWidth : this.scheduled_time_col_width}}>예약시간</th>
                                <th scope="col" style={{width : this.status_col_width, maxWidth : this.status_col_width}}>작업상태</th>
                                <th scope="col" style={{width : this.action_col_width, maxWidth : this.action_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.task_table_item_list}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <button type="button" className="btn btn-primary btn-footer-inside" onClick={()=>{this.onClickBtnNewTask()}}>
                                <img src="./res/img/file-earmark-plus-fill.svg" style={{width:24, height:24}} /> 생성하기
                            </button>
                            <button type="button" className="btn btn-primary btn-footer-inside" data-bs-toggle="modal" data-bs-target={'#' + this.load_link_product_modal_id}>
                                <img src="./res/img/link.svg" style={{width:24, height:24}}/> 링크로 생성
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickBtnRunAll.bind(this)}>
                                <img src="./res/img/play-circle-fill.svg" style={{width:24, height:24}} /> 모두시작
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickBtnStopAll.bind(this)}>
                                <img src="./res/img/pause-circle-fill.svg" style={{width:24, height:24}}/> 모두정지
                            </button>
                            <button type="button" className="btn btn-danger btn-footer-inside" onClick={this.onClickBtnRemoveAll.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/> 모두삭제
                            </button>
                            <LaodingButton
                                ref={this.__ref_product_list_reload_btn}
                                h_on_click={this.onClickBtnProductListReload.bind(this)}
                                btn_label={"상품리스트 갱신"}
                                btn_class={"btn-primary btn-footer-inside"}
                                img_src={"./res/img/cloud-arrow-down-fill.svg"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}