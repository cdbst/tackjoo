class ContentsOrderList extends React.Component {

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.onClickClenup = this.onClickClenup.bind(this);
        this.onClickLoad = this.onClickLoad.bind(this);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.setContents = this.setContents.bind(this);
        this.clearContents = this.clearContents.bind(this);
        this.setFilters = this.setFilters.bind(this);

        this.order_info_list = [];

        this.state = {
           order_table_item_list : [],
           opt_list_product_name : [],
           opt_list_account_email : [],
           opt_list_order_date : [],
           opt_list_order_status : [],
        };

        this.__ref_sel_product_name = React.createRef();
        this.__ref_sel_account_name = React.createRef();
        this.__ref_sel_order_date = React.createRef();
        this.__ref_sel_order_status = React.createRef();
        this.__ref_load_btn = React.createRef();

        this.__mount = false;
        this.__setupColumnsWidth();

    }

    __setupColumnsWidth(){

        this.account_col_width = 240;
        this.product_size_col_width = 120;
        this.product_price_col_width = 180;
        this.order_date_col_width = 240;
        this.order_status_col_width = 120;
        this.actions_col_width = 240;
        this.product_name_col_width = 'calc( 100% - ' + (this.account_col_width + this.order_date_col_width + this.order_status_col_width + this.actions_col_width + this.product_size_col_width + this.product_price_col_width) + 'px)';
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

        Index.g_sys_msg_q.enqueue('안내', '서버로부터 주문내역을 읽어옵니다. 계정 하나당 5~7초정도 소요됩니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

        window.electron.loadOrderListInfo((err, order_info_list) =>{

            this.__ref_load_btn.current.setLoadingStatus(false);

            if(err) Index.g_sys_msg_q.enqueue('경고', err, ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            if(order_info_list.length == 0) return;
            Index.g_sys_msg_q.enqueue('안내', '주문내역을 읽어왔습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            this.order_info_list = order_info_list;
            this.setFilters(this.order_info_list);

            this.clearContents(()=>{
                this.setContents(this.order_info_list);
            });
        });
    }

    setFilters(order_info_list){

        // return {
        //     name : undefined,
        //     size : undefined,
        //     price : undefined,
        //     quantity : undefined,
        //     url : undefined,
        //     img_url : undefined,
        //     status : undefined,
        //     date : undefined,
        //     account_email : undefined,
        //     account_id : undefined,
        //     is_cancelable : undefined,
        //     model_id: undefined,
        //     order_id : undefined,
        //     _id : undefined
        // };

        let product_name_list = common.getValuesFromObjList(order_info_list, 'name');
        product_name_list.unshift('');
        let account_email_list = common.getValuesFromObjList(order_info_list, 'account_email');
        account_email_list.unshift('');
        let order_date_list = common.getValuesFromObjList(order_info_list, 'date', common.get_formatted_date_str);
        order_date_list.unshift('');
        let order_status_list = common.getValuesFromObjList(order_info_list, 'status');
        order_status_list.unshift('');

        this.setState({
            opt_list_product_name : product_name_list,
            opt_list_account_email : account_email_list,
            opt_list_order_date : order_date_list,
            opt_list_order_status : order_status_list,
        }, () => {
            this.__ref_sel_product_name.current.setValue('');
            this.__ref_sel_account_name.current.setValue('');
            this.__ref_sel_order_date.current.setValue('');
            this.__ref_sel_order_status.current.setValue('');
        });
    }

    setContents(order_info_list){
        
        let order_table_item_list = this.__getTableItems(order_info_list);

        this.setState(_ => ({
            order_table_item_list : order_table_item_list,
        }));
    }

    clearContents(__callback){
        
        this.setState({
            order_table_item_list : [],
        }, () => {
            if(__callback)__callback();
        });
    }

    onChangeOption(){
        
        const cur_sel_product_name = this.__ref_sel_product_name.current.getSelectedOptionValue();
        const cur_sel_account_email = this.__ref_sel_account_name.current.getSelectedOptionValue();
        const cur_sel_order_date = this.__ref_sel_order_date.current.getSelectedOptionValue();
        const cur_sel_order_status = this.__ref_sel_order_status.current.getSelectedOptionValue();

        const filtered_order_info_list = this.order_info_list.filter((order_info) =>{
            if( (cur_sel_product_name == '' || cur_sel_product_name == order_info.name) &&
                (cur_sel_account_email == '' || cur_sel_account_email == order_info.account_email) &&
                (cur_sel_order_date == '' || cur_sel_order_date == common.get_formatted_date_str(order_info.date)) &&
                (cur_sel_order_status == '' || cur_sel_order_status == order_info.status)
            ){
                return true;
            }else{
                return false;
            }
        });

        this.setContents(filtered_order_info_list);
    }

    __getTableItems(order_info_list){

        return order_info_list.map((order_info) =>
            <OrderTableItem
                account_col_width = {this.account_col_width}
                product_size_col_width = {this.product_size_col_width}
                product_price_col_width = {this.product_price_col_width}
                order_date_col_width = {this.order_date_col_width}
                order_status_col_width = {this.order_status_col_width}
                actions_col_width = {this.actions_col_width}
                product_name_col_width = {this.product_name_col_width}
                order_info = {order_info}
                key={order_info._id}
            />
        );
    }

    render() {

        return (
            <div className="tab-pane fade" id="order-list" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.CHECKOUTS}>
                <div className="container-fluid">
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-2">
                            <h4 className="contents-title">구매내역</h4>
                        </div>
                        <div className="col-md-2">
                            <LabelSelect ref={this.__ref_sel_account_name} label="계정" options={this.state.opt_list_account_email} h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_product_name} label="상품" options={this.state.opt_list_product_name} label_col_class="col-md-2" select_col_class="col-md-10" h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_order_date} label="구매일시" options={this.state.opt_list_order_date} h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-2">
                            <LabelSelect ref={this.__ref_sel_order_status} label="진행단계" options={this.state.opt_list_order_status} label_col_class="col-md-5" select_col_class="col-md-7" h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>계정명</th>
                                <th scope="col" style={{width : this.product_name_col_width, maxWidth : this.product_name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.product_size_col_width, maxWidth : this.product_size_col_width}}>사이즈</th>
                                <th scope="col" style={{width : this.product_price_col_width, maxWidth : this.product_price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.order_date_col_width, maxWidth : this.order_date_col_width}}>구매일시</th>
                                <th scope="col" style={{width : this.order_status_col_width, maxWidth : this.order_status_col_width}}>진행단계</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.order_table_item_list}
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
