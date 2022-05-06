class ContentsTheDraw extends React.Component {

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.onClickClenup = this.onClickClenup.bind(this);
        this.onClickLoad = this.onClickLoad.bind(this);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.setContents = this.setContents.bind(this);
        this.clearContents = this.clearContents.bind(this);
        this.setFilters = this.setFilters.bind(this);
        this.onCreateTask = this.onCreateTask.bind(this);

        this.thedraw_item_list = [];

        this.state = {
           draw_table_item_list : [],
           opt_list_product_name : [],
           opt_list_account_email : [],
           opt_list_draw_date : [],
           opt_list_draw_result : [],
        };

        this.__ref_sel_product_name = React.createRef();
        this.__ref_sel_account_name = React.createRef();
        this.__ref_sel_draw_date = React.createRef();
        this.__ref_sel_draw_result = React.createRef();
        this.__ref_load_btn = React.createRef();

        this.__mount = false;
        this.__setupColumnsWidth();

    }

    __setupColumnsWidth(){

        this.image_col_width = 70;
        this.account_col_width = 240;
        this.product_size_col_width = 120;
        this.product_price_col_width = 180;
        this.draw_date_col_width = 240;
        this.draw_result_col_width = 120;
        this.actions_col_width = 240;
        this.product_name_col_width = 'calc( 100% - ' + (this.image_col_width + this.account_col_width + this.draw_date_col_width + this.draw_result_col_width + this.actions_col_width + this.product_size_col_width + this.product_price_col_width) + 'px)';
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickClenup(){
        this.clearContents();
    }

    onClickLoad(){

        this.__ref_load_btn.current.setLoadingStatus(true);

        Index.g_sys_msg_q.enqueue('안내', '서버로부터 THE DRAW 당첨 결과를 읽어옵니다. 계정 하나당 5~7초정도 소요됩니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

        window.electron.loadTheDrawItemList((err, thedraw_item_list) =>{

            this.__ref_load_btn.current.setLoadingStatus(false);

            if(err) Index.g_sys_msg_q.enqueue('경고', err, ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            if(thedraw_item_list.length == 0) return;
            Index.g_sys_msg_q.enqueue('안내', 'THE DRAW 당첨결과를 읽어왔습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            this.thedraw_item_list = thedraw_item_list;

            this.clearContents(()=>{
                this.setFilters(this.thedraw_item_list);
                this.setContents(this.thedraw_item_list);
            });
        });
    }

    setFilters(thedraw_item_list){

        let product_name_list = common.getValuesFromObjList(thedraw_item_list, 'product_name');
        product_name_list.unshift('');

        let account_email_list = common.getValuesFromObjList(thedraw_item_list, 'account_email');
        account_email_list.unshift('');

        let draw_date_list = common.getValuesFromObjList(thedraw_item_list, 'draw_date');
        draw_date_list.sort((a, b)=>{ 
            if(a > b) return -1;
            else if(a < b) return 1;
            else return 0;
        });
        draw_date_list = draw_date_list.map((date)=> common.get_formatted_date_str(date));
        draw_date_list = [...new Set(draw_date_list)];
        draw_date_list.unshift('');
        
        let draw_result_list = common.getValuesFromObjList(thedraw_item_list, 'draw_result');
        draw_result_list.unshift('');

        this.setState({
            opt_list_product_name : product_name_list,
            opt_list_account_email : account_email_list,
            opt_list_draw_date : draw_date_list,
            opt_list_draw_result : draw_result_list
        }, () => {
            this.__ref_sel_product_name.current.setValue('');
            this.__ref_sel_account_name.current.setValue('');
            this.__ref_sel_draw_date.current.setValue('');
            this.__ref_sel_draw_result.current.setValue('');
        });
    }

    setContents(thedraw_item_list){
        
        let draw_table_item_list = this.__getTableItems(thedraw_item_list);

        this.setState(_ => ({
            draw_table_item_list : draw_table_item_list,
        }));
    }

    clearContents(__callback){
        
        this.setState({
            draw_table_item_list : [],
            opt_list_product_name : [],
            opt_list_account_email : [],
            opt_list_draw_date : [],
            opt_list_draw_result : []
        }, () => {
            this.__ref_sel_product_name.current.setValue('');
            this.__ref_sel_account_name.current.setValue('');
            this.__ref_sel_draw_date.current.setValue('');
            this.__ref_sel_draw_result.current.setValue('');
            if(__callback)__callback();
        });
    }

    onChangeOption(){
        
        const cur_sel_product_name = this.__ref_sel_product_name.current.getSelectedOptionValue();
        const cur_sel_account_email = this.__ref_sel_account_name.current.getSelectedOptionValue();
        const cur_sel_draw_date = this.__ref_sel_draw_date.current.getSelectedOptionValue();
        const cur_sel_draw_result = this.__ref_sel_draw_result.current.getSelectedOptionValue();

        const filtered_thedraw_item_list = this.thedraw_item_list.filter((draw_item) =>{
            if( (cur_sel_product_name == '' || cur_sel_product_name == draw_item.product_name) &&
                (cur_sel_account_email == '' || cur_sel_account_email == draw_item.account_email) &&
                (cur_sel_draw_date == '' || cur_sel_draw_date == common.get_formatted_date_str(draw_item.draw_date)) &&
                (cur_sel_draw_result == '' || cur_sel_draw_result == draw_item.draw_result)
            ){
                return true;
            }else{
                return false;
            }
        });

        this.setContents(filtered_thedraw_item_list);
    }

    __getTableItems(draw_item_list){

        return draw_item_list.map((draw_item) =>
            <TheDrawTableItem
                account_col_width = {this.account_col_width}
                product_size_col_width = {this.product_size_col_width}
                product_price_col_width = {this.product_price_col_width}
                draw_date_col_width = {this.draw_date_col_width}
                draw_result_col_width = {this.draw_result_col_width}
                actions_col_width = {this.actions_col_width}
                product_name_col_width = {this.product_name_col_width}
                image_col_width = {this.image_col_width}
                h_on_create_task={this.onCreateTask.bind(this)}
                draw_item = {draw_item}
                key={draw_item._id}
            />
        );
    }

    onCreateTask(product_url, account_email){
        window.electron.getProductInfo(product_url, (error, product_info) =>{
            
            if(error !== undefined || product_info === undefined){
                Index.g_sys_msg_q.enqueue('안내', '상품 정보를 읽을 수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            if(product_info.draw_id === undefined){
                Index.g_sys_msg_q.enqueue('안내', '진행 중인 DRAW 상품이 아닙니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            common.update_product_info_obj(product_info, 'url', product_url);
            //상품 구매 타입을 Buy로 변환시켜준다. (더이상 The draw 타입이 아님.)
            common.update_product_info_obj(product_info, 'sell_type', common.SELL_TYPE.normal);
            this.props.contents_task_ref.current.create_quick_task(product_info, account_email);
        });
    }

    render() {

        return (
            <div className="tab-pane fade" id="thedraw" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.THEDRAW}>
                <div className="container-fluid">
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-2">
                            <h4 className="contents-title">응모</h4>
                        </div>
                        <div className="col-md-2">
                            <LabelSelect ref={this.__ref_sel_account_name} label="계정" options={this.state.opt_list_account_email} h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_product_name} label="상품" options={this.state.opt_list_product_name} label_col_class="col-md-2" select_col_class="col-md-10" h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_draw_date} label="응모일시" options={this.state.opt_list_draw_date} h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-2">
                            <LabelSelect ref={this.__ref_sel_draw_result} label="당첨여부" options={this.state.opt_list_draw_result} label_col_class="col-md-5" select_col_class="col-md-7" h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.image_col_width, maxWidth : this.image_col_width}}>이미지</th>
                                <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>계정명</th>
                                <th scope="col" style={{width : this.product_name_col_width, maxWidth : this.product_name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.product_size_col_width, maxWidth : this.product_size_col_width}}>사이즈</th>
                                <th scope="col" style={{width : this.product_price_col_width, maxWidth : this.product_price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.draw_date_col_width, maxWidth : this.draw_date_col_width}}>응모일시</th>
                                <th scope="col" style={{width : this.draw_result_col_width, maxWidth : this.draw_result_col_width}}>당첨결과</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.draw_table_item_list}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <LaodingButton
                                ref={this.__ref_load_btn}
                                h_on_click={this.onClickLoad.bind(this)}
                                btn_label={"불러오기"}
                                btn_class={"btn-primary btn-footer-inside"}
                                img_src={"./res/img/cloud-arrow-down-fill.svg"}
                            />
                            <button type="button" className="btn btn-danger btn-footer-inside" onClick={this.onClickClenup.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/> 초기화
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
