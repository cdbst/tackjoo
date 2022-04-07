
class ContentsNewProduct extends React.Component {

    WHITELIST_EDIT_MODAL_ID = 'whitelist-edit-modal';
    BLACKLIST_EDIT_MODAL_ID = 'blacklist-edit-modal';

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.__getTableItems = this.__getTableItems.bind(this);
        this.__updateTableItems = this.__updateTableItems.bind(this);
        this.__onClickWatchBtn = this.__onClickWatchBtn.bind(this);
        this.onRemoveProduct = this.onRemoveProduct.bind(this);
        this.__onClickRemoveAll = this.__onClickRemoveAll.bind(this)
        this.__onSubmitWhitelistInfo = this.__onSubmitWhitelistInfo.bind(this);
        this.__onCancelSubmitWhitelistInfo = this.__onCancelSubmitWhitelistInfo.bind(this);
        this.onCreateTask = this.onCreateTask.bind(this);
        this.showWhitelistEditModal = this.showWhitelistEditModal.bind(this);
        this.showBlacklistEditModal = this.showBlacklistEditModal.bind(this);
        this.updateWhiteInfolist = this.updateWhiteInfolist.bind(this);
        this.updateBlacklistInfolist = this.updateBlacklistInfolist.bind(this);
        this.loadWhitelistInfolist = this.loadWhitelistInfolist.bind(this);
        this.loadBlacklistInfolist = this.loadBlacklistInfolist.bind(this);
        this.checkProductInfoWithWhiteList = this.checkProductInfoWithWhiteList.bind(this);
        this.checkProductInfoWithBlackList = this.checkProductInfoWithBlackList.bind(this);
        this.__watchBtnRefCb = this.__watchBtnRefCb.bind(this);
        this.__onCancelSubmitBlacklistInfo = this.__onCancelSubmitBlacklistInfo.bind(this);
        this.__onSubmitBlacklistInfo = this.__onSubmitBlacklistInfo.bind(this);
        this.genQuickTaskAutomatically = this.genQuickTaskAutomatically.bind(this);
        this.onFilterChanged = this.onFilterChanged.bind(this);

        this.whitelist_info_list = [];
        this.blacklist_info_list = [];
        this.__product_info_list = [];

        this.state = {
            product_table_list : []
        };

        this.__ref_watch_btn = undefined;
        this.__ref_whitelist_edit_modal = React.createRef();
        this.__ref_blacklist_edit_modal = React.createRef();
        this.__ref_sel_whitelist_filter = React.createRef();

        this.__mount = false;
        this.__setupColumnsWidth();
    }

    __watchBtnRefCb(element){
        this.__ref_watch_btn = element;
    }

    __setupColumnsWidth(){

        this.image_col_width = 70;
        this.price_col_width = 140;
        this.kream_price_col_width = 140;
        this.price_gap_col_width = 180;
        this.actions_col_width = 204;
        this.soldout_status_col_width = 102;
        this.release_date_col_width = 165;
        this.model_id_col_width = 127;
        this.kream_interest_col_width = 106;
        this.name_col_width = 'calc( 100% - ' + (this.price_gap_col_width + this.actions_col_width + this.kream_price_col_width + this.price_col_width + this.image_col_width + this.soldout_status_col_width + this.release_date_col_width) + 'px)';
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    updateWhiteInfolist(whitelist_info_list){

        this.whitelist_info_list = whitelist_info_list;
        this.__updateTableItems();

        window.electron.saveNewProductWhiteListInfo(this.whitelist_info_list, (err)=>{
            if(err){
                Index.g_sys_msg_q.enqueue('에러', `화이트리스트를 저장하지 못했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            Index.g_sys_msg_q.enqueue('안내', `화이트리스트를 성공적으로 저장했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    updateBlacklistInfolist(blacklist_info_list){

        this.blacklist_info_list = blacklist_info_list;

        window.electron.saveNewProductBlackListInfo(this.blacklist_info_list, (err)=>{
            if(err){
                Index.g_sys_msg_q.enqueue('에러', `블랙리스트를 저장하지 못했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            Index.g_sys_msg_q.enqueue('안내', `블랙리스트를 성공적으로 저장했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    onRemoveProduct(product_id){

        this.__product_info_list = this.__product_info_list.filter((product_info)=> product_info._id !== product_id);
        this.__updateTableItems();
    }

    __updateTableItems(){
        if(this.__mount == false) return;

        const table_items = this.__getTableItems(this.__product_info_list);
        this.setState(_ => ({
            product_table_list : table_items
        }));
    }

    __getTableItems(product_info_list){

        const table_items = [];

        const filter_opt = this.__ref_sel_whitelist_filter.current.getSelectedOptionValue();
        const use_filter = filter_opt === '적용';

        product_info_list.forEach((product_info) => {

            let display = '';
            let background = 'transparent';
            const [_, white_list_idx] = this.checkProductInfoWithWhiteList(product_info, true);
            if(use_filter) display = white_list_idx === -1 ? 'none' : '';
            else background = white_list_idx === -1 ? 'transparent' : '#F2ACAA';
            

            table_items.push(<NewProductTableItem
                image_col_width={this.image_col_width}
                name_col_width={this.name_col_width}
                price_col_width={this.price_col_width}
                kream_price_col_width={this.kream_price_col_width}
                actions_col_width={this.actions_col_width}
                release_date_col_width={this.release_date_col_width}
                model_id_col_width={this.model_id_col_width}
                soldout_status_col_width={this.soldout_status_col_width}
                price_gap_col_width={this.price_gap_col_width}
                kream_interest_col_width={this.kream_interest_col_width}
                product_info={product_info}
                h_on_remove={this.onRemoveProduct.bind(this)}
                h_on_create_task={this.onCreateTask.bind(this)}
                key={product_info._id}
                display={display}
                background={background}
            />);
        });
            
        return table_items;
    }

    onCreateTask(product_info){
        this.props.contents_task_ref.current.create_quick_task(product_info);
    }

    onFilterChanged(){
        this.__updateTableItems();
    }

    checkProductInfoWithWhiteList(product_info, ignore_task_cnt = false){

        let create_task_cnt = 0;
        let white_list_idx = -1;
        
        this.whitelist_info_list.every((whitelist_info, idx)=>{
            const task_cnt = parseInt(whitelist_info.task_cnt);
            if(ignore_task_cnt === false && task_cnt === 0) return true;
            if(product_info.name.includes(whitelist_info.keyword) || product_info.model_id.includes(whitelist_info.keyword)){
                create_task_cnt = task_cnt;
                white_list_idx = idx;
                return false;
            }else{
                return true;
            }
        });

        return [create_task_cnt, white_list_idx];
    }

    checkProductInfoWithBlackList(product_info){

        let exists_in_blacklist = false;
        
        this.blacklist_info_list.filter((blacklist_info) => blacklist_info !== '').every((blacklist_info)=>{
            if(product_info.name.includes(blacklist_info) || product_info.model_id.includes(blacklist_info)){
                exists_in_blacklist = true;
                return false;
            }else{
                return true;
            }
        });

        return exists_in_blacklist;
    }

    genQuickTaskAutomatically(new_product_info_list){

        const use_auto_task = Index.g_settings_info.getSetting('new_product_quick_task_use_auto_task');
        if(use_auto_task === 0) return;

        const quick_task_list = [];

        new_product_info_list.forEach((product_info)=>{
            
            if(product_info.soldout || this.checkProductInfoWithBlackList(product_info)) return;

            const [task_cnt, white_list_idx] = this.checkProductInfoWithWhiteList(product_info);
            if(task_cnt === 0) return;
                
            quick_task_list.push({
                product_info : product_info,
                task_cnt : task_cnt,
                white_list_idx : white_list_idx
            });    
        });

        if(quick_task_list.length === 0) return;

        quick_task_list.sort((a, b) =>{
            return a.white_list_idx - b.white_list_idx;
        });

        const quick_task_product_list = [];

        quick_task_list.forEach((quick_task_item) =>{
            for(var i = 0; i < quick_task_item.task_cnt; i++){
                quick_task_product_list.push(quick_task_item.product_info);
            }
        });

        const timer = setInterval(()=>{
            const product_info = quick_task_product_list.shift();
            if(product_info === undefined){
                clearInterval(timer);
            }else{
                this.props.contents_task_ref.current.create_quick_task(product_info);
            }
        }, 100);
    }

    __onClickWatchBtn(status){

        this.__ref_watch_btn.setDisabled(true);

        if(status){

            Index.g_sys_msg_q.enqueue('알림', `신상품을 감시하는 기능이 시작되었습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            window.electron.startWatchingNewReleased(Index.g_settings_info.settings_info, (stop, new_product_info_list)=>{

                this.__ref_watch_btn.setDisabled(false);

                if(stop){
                    this.__ref_watch_btn.setBtnState(false);
                    Index.g_sys_msg_q.enqueue('알림', `신상품을 감시하는 기능이 중지됐습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
                    return;
                }

                if(new_product_info_list === undefined || new_product_info_list.length === 0) return;

                this.genQuickTaskAutomatically(new_product_info_list);

                new_product_info_list.forEach((product_info)=>{
                    this.__product_info_list.push(product_info);
                });

                //Index.g_sys_msg_q.enqueue('알림', `신상품 ${new_product_info_list.length}개의 등록이 확인되었습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
                window.electron.notifyNewProductList(new_product_info_list);

                this.__updateTableItems();
            });
        }else{
            Index.g_sys_msg_q.enqueue('알림', `신상품의 감시를 정지하도록 시도합니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
            window.electron.stopWatchingNewReleased();
        }
    }

    __onClickRemoveAll(){
        Index.g_prompt_modal.popModal('경고', <p>모든 상품을 삭제하시겠습니까?</p>, (is_ok)=>{
            if(is_ok == false) return;
            this.__product_info_list = [];
            this.__updateTableItems();
        });
    }

    loadBlacklistInfolist(){

        window.electron.loadNewProductBlackListInfo((err, blacklist_info_list)=>{
            if(err){
                //Index.g_sys_msg_q.enqueue('에러', `블랙리스트를 불러오지 못했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }
            
            Index.g_sys_msg_q.enqueue('안내', `블랙리스트를 성공적으로 불러왔습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
            this.blacklist_info_list = blacklist_info_list;

            let blacklist_text = '';
            blacklist_info_list.forEach((blacklist_info)=>{
                blacklist_text += `${blacklist_info}\n`;
            });

            this.__ref_blacklist_edit_modal.current.setTextEditValue(blacklist_text);
        });
    }

    loadWhitelistInfolist(){

        window.electron.loadNewProductWhiteListInfo((err, whitelist_info_list)=>{
            if(err){
                //Index.g_sys_msg_q.enqueue('에러', `화이트리스트를 불러오지 못했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }
            
            Index.g_sys_msg_q.enqueue('안내', `화이트리스트를 성공적으로 불러왔습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
            this.whitelist_info_list = whitelist_info_list;

            let whitelist_text = '';
            whitelist_info_list.forEach((whitelist_info)=>{
                whitelist_text += `${whitelist_info.keyword}:${whitelist_info.task_cnt}\n`;
            });

            this.__ref_whitelist_edit_modal.current.setTextEditValue(whitelist_text);
        });
    }

    __onCancelSubmitBlacklistInfo(){

        let blacklist_text = '';
        this.blacklist_info_list.forEach((blacklist_info)=>{
            blacklist_text += `${blacklist_info}\n`;
        });
        this.__ref_blacklist_edit_modal.current.setTextEditValue(blacklist_text);
    }

    __onSubmitBlacklistInfo(_blacklist_info_list){

        const blacklist_info_list = _blacklist_info_list.split('\n');
        const error_messages = [];

        for(var i = 0; i < blacklist_info_list.length; i++){
            const blacklist_info = blacklist_info_list[i];

            if(blacklist_info.trim() === ''){
                error_messages.push(`[${i + 1}]번째 줄의 입력 값이 비어있는 상태입니다.`);
                continue;
            }
        }

        if(error_messages.length > 0){
            Index.g_prompt_modal.popModal('에러 정보', CommonUtils.getTextListTag(error_messages), ()=>{this.showBlacklistEditModal()});
            return;
        }
        
        this.updateBlacklistInfolist(blacklist_info_list);
    }

    __onCancelSubmitWhitelistInfo(){

        let whitelist_text = '';
        this.whitelist_info_list.forEach((whitelist_info)=>{
            whitelist_text += `${whitelist_info.keyword}:${whitelist_info.task_cnt}\n`;
        });
        this.__ref_whitelist_edit_modal.current.setTextEditValue(whitelist_text);
    }

    __onSubmitWhitelistInfo(_whitelist_info_list){
        const whitelist_info_list = _whitelist_info_list.split('\n');
        const error_messages = [];
        const whitelist_info_obj_list = [];

        for(var i = 0; i < whitelist_info_list.length; i++){
            const whitelist_info = whitelist_info_list[i];

            if(whitelist_info.trim() === ''){
                error_messages.push(`[${i + 1}]번째 줄의 입력 값이 비어있는 상태입니다.`);
                continue;
            }

            const keyword_taskcnt_info_array = whitelist_info.split(':');
            if(keyword_taskcnt_info_array.length < 2){
                error_messages.push(`[${i + 1}]번째 줄의 입력값이 올바르지 않습니다. (${whitelist_info})`);
                continue;
            }

            const task_cnt = keyword_taskcnt_info_array.pop().trim();
            const keyword = keyword_taskcnt_info_array.join(':').trim();
            
            //유효성 검사 : 작업 생성 개수 정보가 올바른 포멧인지 확인 필요.
            if(new RegExp('^[0-9]+$').test(task_cnt) === false){
                error_messages.push(`[${i + 1}]번째 줄의 작업 생성 수량 값이 올바른 형태가 아닙니다. (${whitelist_info})`);
                continue;
            }

            if(keyword === ''){
                error_messages.push(`[${i + 1}]번째 줄의 키워드 또는 제품 코드 값이 빈상태 입니다. (${whitelist_info})`);
                continue;
            }

            const whitelist_info_obj = {
                keyword: keyword,
                task_cnt: task_cnt,
                _id: common.uuidv4()
            };

            whitelist_info_obj_list.push(whitelist_info_obj);            
        }
        
        if(error_messages.length > 0){
            Index.g_prompt_modal.popModal('에러 정보', CommonUtils.getTextListTag(error_messages), ()=>{this.showWhitelistEditModal()});
            return;
        }

        this.updateWhiteInfolist(whitelist_info_obj_list);
    }

    showWhitelistEditModal(){
        const el_modal = document.getElementById(this.WHITELIST_EDIT_MODAL_ID);
        var bs_obj_modal = bootstrap.Modal.getInstance(el_modal);
        bs_obj_modal.show();
    }

    showBlacklistEditModal(){
        const el_modal = document.getElementById(this.BLACKLIST_EDIT_MODAL_ID);
        var bs_obj_modal = bootstrap.Modal.getInstance(el_modal);
        bs_obj_modal.show();
    }

    render() {

        return (
            <div className="tab-pane fade" id="new-product" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.NEW_PRODUCT}>
                <div className="container-fluid">
                    <TextareaEditModal 
                        id={this.WHITELIST_EDIT_MODAL_ID} 
                        h_submit={this.__onSubmitWhitelistInfo.bind(this)}
                        h_cancel={this.__onCancelSubmitWhitelistInfo.bind(this)}
                        title="화이트리스트 설정"
                        desc="한 줄당 하나의 항목 입력 👉 상품키워드 또는 제품코드:생성할 작업 수량 [예> 조던 1 로우:2]"
                        on_load_textedit={this.loadWhitelistInfolist.bind(this)}
                        ref={this.__ref_whitelist_edit_modal}
                    />
                    <TextareaEditModal 
                        id={this.BLACKLIST_EDIT_MODAL_ID} 
                        h_submit={this.__onSubmitBlacklistInfo.bind(this)}
                        h_cancel={this.__onCancelSubmitBlacklistInfo.bind(this)}
                        title="블랙리스트 설정"
                        desc="블랙리스트에 해당하는 상품은 작업으로 생성하지 않습니다. 👉 상품키워드 또는 제품코드를 라인단위로 입력"
                        on_load_textedit={this.loadBlacklistInfolist.bind(this)}
                        ref={this.__ref_blacklist_edit_modal}
                    />
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-2">
                        <h4 className="contents-title">{`신상품(${this.state.product_table_list.length})`}</h4>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect 
                                ref={this.__ref_sel_whitelist_filter} 
                                label="화이트리스트" 
                                options={['미적용', '적용']} 
                                label_col_class="col-md-4" 
                                select_col_class="col-md-4"
                                h_on_change={this.onFilterChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.image_col_width, maxWidth : this.image_col_width}}>이미지</th>
                                <th scope="col" style={{width : this.name_col_width, maxWidth : this.name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.model_id_col_width, maxWidth : this.model_id_col_width}}>모델(스타일)</th>
                                <th scope="col" style={{width : this.price_col_width, maxWidth : this.price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.kream_price_col_width, maxWidth : this.kream_price_col_width}}>크림가격</th>
                                <th scope="col" style={{width : this.price_gap_col_width, maxWidth : this.price_gap_col_width}}>시세차익</th>
                                <th scope="col" style={{width : this.kream_interest_col_width, maxWidth : this.kream_interest_col_width}}>크림관심도</th>
                                <th scope="col" style={{width : this.soldout_status_col_width, maxWidth : this.soldout_status_col_width}}>재고 상태</th>
                                <th scope="col" style={{width : this.release_date_col_width, maxWidth : this.release_date_col_width}}>감지 시간</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.product_table_list}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <ToggleButton
                                ref={this.__watchBtnRefCb.bind(this)}
                                h_on_click={this.__onClickWatchBtn.bind(this)}
                                init_state={false}
                                set_btn_label={"감시 취소"}
                                unset_btn_label={"감시 시작"}
                                set_img_src={"./res/img/tail-spin.svg"}
                                unset_img_src={"./res/img/search.svg"}
                                btn_class={"btn-primary btn-footer-inside"}
                            />
                            
                            <button type="button" className="btn btn-danger btn-footer-inside" onClick={this.__onClickRemoveAll.bind(this)} >
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/> 모두삭제
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" data-bs-toggle="modal" data-bs-target={'#' + this.WHITELIST_EDIT_MODAL_ID} >
                                <img src="./res/img/pencil-square.svg" style={{width:24, height:24}}/> 화이트리스트
                            </button>
                            <button type="button" className="btn btn-danger btn-footer-inside" data-bs-toggle="modal" data-bs-target={'#' + this.BLACKLIST_EDIT_MODAL_ID} >
                                <img src="./res/img/pencil-square.svg" style={{width:24, height:24}}/> 블랙리스트
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}