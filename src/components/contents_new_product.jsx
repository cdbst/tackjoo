
class ContentsNewProduct extends React.Component {

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.__getTableItems = this.__getTableItems.bind(this);
        this.__updateTableItems = this.__updateTableItems.bind(this);
        this.__onClickWatchBtn = this.__onClickWatchBtn.bind(this);
        this.onRemoveProduct = this.onRemoveProduct.bind(this);
        this.__onClickRemoveAll = this.__onClickRemoveAll.bind(this)
        this.onCreateTask = this.onCreateTask.bind(this);

        this.__watchBtnRefCb = this.__watchBtnRefCb.bind(this);

        this.__product_info_list = [];

        this.state = {
            product_table_list : []
        };

        this.__ref_watch_btn = undefined;

        this.__mount = false;
        this.__setupColumnsWidth();
    }

    __watchBtnRefCb(element){
        this.__ref_watch_btn = element;
    }

    __setupColumnsWidth(){

        this.image_col_width = 180;
        this.price_col_width = 160;
        this.kream_price_col_width = 160;
        this.actions_col_width = 240;
        this.soldout_status_col_width = 140;
        this.release_date_col_width = 190;
        this.name_col_width = 'calc( 100% - ' + (this.actions_col_width + this.kream_price_col_width + this.price_col_width + this.image_col_width + this.soldout_status_col_width + this.release_date_col_width) + 'px)';
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onRemoveProduct(product_id){

        Index.g_prompt_modal.popModal('경고', <p>상품을 삭제하시겠습니까?</p>, (is_ok)=>{
            if(is_ok == false) return;
            this.__product_info_list = this.__product_info_list.filter((product_info)=> product_info._id !== product_id);
            this.__updateTableItems();
        });
    }

    __updateTableItems(){
        if(this.__mount == false) return;
        const table_items = this.__getTableItems(this.__product_info_list);
        this.setState(_ => ({
            product_table_list : table_items
        }));
    }

    __getTableItems(product_info_list){

        return product_info_list.map((product_info) =>
            <NewProductTableItem
                image_col_width={this.image_col_width}
                name_col_width={this.name_col_width}
                price_col_width={this.price_col_width}
                kream_price_col_width={this.kream_price_col_width}
                actions_col_width={this.actions_col_width}
                release_date_col_width={this.release_date_col_width}
                soldout_status_col_width={this.soldout_status_col_width}
                product_info={product_info}
                h_on_remove={this.onRemoveProduct.bind(this)}
                h_on_create_task={this.onCreateTask.bind(this)}
                key={product_info._id}
            />
        );
    }

    onCreateTask(product_info){
        this.props.contents_task_ref.current.create_quick_task(product_info);
    }

    __onClickWatchBtn(status){

        this.__ref_watch_btn.setDisabled(true);

        if(status){
            window.electron.startWatchingNewReleased(Index.g_settings_info.settings_info, (stop, new_product_info_list)=>{
                this.__ref_watch_btn.setDisabled(false);
                if(stop) this.__ref_watch_btn.setBtnState(false);
                if(new_product_info_list === undefined || new_product_info_list.length === 0) return;

                Index.g_sys_msg_q.enqueue('알림', `신상품 ${new_product_info_list.length}개의 등록이 확인되었습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

                new_product_info_list.forEach((product_info)=>{
                    this.__product_info_list.push(product_info);
                });

                this.__updateTableItems();
            });
        }else{
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

    render() {

        return (
            <div className="tab-pane fade" id="new-product" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.NEW_PRODUCT}>
                <div className="container-fluid">
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">{`신상품(${this.state.product_table_list.length})`}</h4>
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
                                <th scope="col" style={{width : this.name_col_width, maxWidth : this.name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.price_col_width, maxWidth : this.price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.kream_price_col_width, maxWidth : this.kream_price_col_width}}>크림 시세</th>
                                <th scope="col" style={{width : this.release_date_col_width, maxWidth : this.release_date_col_width}}>출시 일자</th>
                                <th scope="col" style={{width : this.soldout_status_col_width, maxWidth : this.soldout_status_col_width}}>재고 상태</th>
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}