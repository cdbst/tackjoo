class ContentsReturned extends React.Component {

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.onClickClenup = this.onClickClenup.bind(this);
        this.onClickLoad = this.onClickLoad.bind(this);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.setContents = this.setContents.bind(this);
        this.clearContents = this.clearContents.bind(this);
        this.setFilters = this.setFilters.bind(this);
        this.updateReturnedInfo = this.updateReturnedInfo.bind(this);

        this.returned_info_list = [];

        this.state = {
           returned_table_item_list : [],
           opt_list_product_name : [],
           opt_list_account_email : [],
           opt_list_return_req_date : [],
           opt_list_returned_status : [],
        };

        this.__ref_sel_product_name = React.createRef();
        this.__ref_sel_account_name = React.createRef();
        this.__ref_sel_returned_date = React.createRef();
        this.__ref_sel_returned_status = React.createRef();
        this.__ref_load_btn = React.createRef();

        this.__mount = false;
        this.__setupColumnsWidth();

    }

    __setupColumnsWidth(){

        this.account_col_width = 240;
        this.product_size_col_width = 100;
        this.product_price_col_width = 140;
        this.returned_date_col_width = 120;
        this.actions_col_width = 180;
        this.product_img_col_width = 70;
        this.product_model_id_col_width = 120;
        this.returned_number_col_width = 260;
        this.returned_quantity_col_width = 60;
        this.returned_status_col_width = 160;

        this.product_name_col_width = 'calc( 100% - ' + (
            this.product_model_id_col_width + 
            this.product_img_col_width + 
            this.account_col_width + 
            this.returned_date_col_width + 
            this.actions_col_width + 
            this.product_size_col_width + 
            this.product_price_col_width + 
            this.returned_number_col_width +
            this.returned_quantity_col_width +
            this.returned_status_col_width) + 'px)';
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

        Index.g_sys_msg_q.enqueue('안내', '서버로부터 반품 현황 항목들을 읽어옵니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

        window.electron.loadReturnedInfoList((err, returned_info_list) =>{

            this.__ref_load_btn.current.setLoadingStatus(false);

            if(err) Index.g_sys_msg_q.enqueue('경고', err, ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            if(returned_info_list.length == 0){
                Index.g_sys_msg_q.enqueue('안내', '반품 현황 항목이 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
                return;
            } 
            Index.g_sys_msg_q.enqueue('안내', '반품 현황 항목들을 읽어왔습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            this.returned_info_list = returned_info_list;
            
            this.clearContents(()=>{
                this.setFilters(this.returned_info_list);
                this.setContents(this.returned_info_list);
            });
        });
    }

    setFilters(returned_info_list){

        let product_name_list = common.getValuesFromObjList(returned_info_list, 'product_name');
        product_name_list.unshift('');

        let account_email_list = common.getValuesFromObjList(returned_info_list, 'account_email');
        account_email_list.unshift('');

        let returned_date_list = common.getValuesFromObjList(returned_info_list, 'returned_date');
        returned_date_list.sort((a, b)=>{ 
            if(a > b) return -1;
            else if(a < b) return 1;
            else return 0;
        });
        returned_date_list = returned_date_list.map((date)=> common.get_formatted_date_str(date));
        returned_date_list = [...new Set(returned_date_list)];
        returned_date_list.unshift('');

        let returned_status_list = common.getValuesFromObjList(returned_info_list, 'returned_status');
        returned_status_list.unshift('');

        this.setState({
            opt_list_product_name : product_name_list,
            opt_list_account_email : account_email_list,
            opt_list_return_req_date : returned_date_list,
            opt_list_returned_status : returned_status_list,
        }, () => {
            this.__ref_sel_product_name.current.setValue('');
            this.__ref_sel_account_name.current.setValue('');
            this.__ref_sel_returned_date.current.setValue('');
            this.__ref_sel_returned_status.current.setValue('');
        });
    }

    setContents(returned_info_list){
        
        let returned_table_item_list = this.__getTableItems(returned_info_list);

        this.setState(_ => ({
            returned_table_item_list : returned_table_item_list,
        }));
    }

    clearContents(__callback){
        
        this.setState({
            returned_table_item_list : [],
            opt_list_product_name : [],
            opt_list_account_email : [],
            opt_list_return_req_date : [],
            opt_list_returned_status : [],
        }, () => {
            this.__ref_sel_product_name.current.setValue('');
            this.__ref_sel_account_name.current.setValue('');
            this.__ref_sel_returned_date.current.setValue('');
            this.__ref_sel_returned_status.current.setValue('');
            if(__callback)__callback();
        });
    }

    onChangeOption(){
        
        const cur_sel_product_name = this.__ref_sel_product_name.current.getSelectedOptionValue();
        const cur_sel_account_email = this.__ref_sel_account_name.current.getSelectedOptionValue();
        const cur_sel_returned_date = this.__ref_sel_returned_date.current.getSelectedOptionValue();
        const cur_sel_returned_status = this.__ref_sel_returned_status.current.getSelectedOptionValue();

        const filtered_returned_info_list = this.returned_info_list.filter((returned_info) =>{
            if( (cur_sel_product_name == '' || cur_sel_product_name == returned_info.product_name) &&
                (cur_sel_account_email == '' || cur_sel_account_email == returned_info.account_email) &&
                (cur_sel_returned_date == '' || cur_sel_returned_date == common.get_formatted_date_str(returned_info.returned_date)) &&
                (cur_sel_returned_status == '' || cur_sel_returned_status == returned_info.returned_status)
            ){
                return true;
            }else{
                return false;
            }
        });

        this.setContents(filtered_returned_info_list);
    }

    __getTableItems(returned_info_list){

        return returned_info_list.map((returned_info) =>
            <ReturnedTableItem
                account_col_width = {this.account_col_width}
                product_size_col_width = {this.product_size_col_width}
                product_price_col_width = {this.product_price_col_width}
                returned_date_col_width = {this.returned_date_col_width}
                actions_col_width = {this.actions_col_width}
                product_img_col_width = {this.product_img_col_width}
                product_model_id_col_width = {this.product_model_id_col_width}
                returned_number_col_width = {this.returned_number_col_width}
                returned_quantity_col_width = {this.returned_quantity_col_width}
                returned_status_col_width = {this.returned_status_col_width}
                product_name_col_width = {this.product_name_col_width}
                returned_info = {returned_info}
                h_update_returned_info = {this.updateReturnedInfo.bind(this)}
                key={returned_info._id}
            />
        );
    }

    updateReturnedInfo(_returned_info){

        for(i = 0; i < this.returned_info_list.length; i++){
            if(this.returned_info_list[i]._id !== _returned_info._id) continue;
            this.returned_info_list[i] = _returned_info;
            break;
        }

        this.onChangeOption();
    }

    render() {

        return (
            <div className="tab-pane fade" id="returned" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.RETURNED}>
                <div className="container-fluid">
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-2">
                            <h4 className="contents-title">반품현황</h4>
                        </div>
                        <div className="col-md-2">
                            <LabelSelect ref={this.__ref_sel_account_name} label="계정" options={this.state.opt_list_account_email} h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_product_name} label="상품" options={this.state.opt_list_product_name} label_col_class="col-md-2" select_col_class="col-md-10" h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_returned_date} label="반품요청일" options={this.state.opt_list_return_req_date} h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-2">
                            <LabelSelect ref={this.__ref_sel_returned_status} label="진행단계" options={this.state.opt_list_returned_status} label_col_class="col-md-5" select_col_class="col-md-7" h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.product_img_col_width, maxWidth : this.product_img_col_width}}>이미지</th>
                                <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>계정명</th>
                                <th scope="col" style={{width : this.product_name_col_width, maxWidth : this.product_name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.product_model_id_col_width, maxWidth : this.product_model_id_col_width}}>모델</th>
                                <th scope="col" style={{width : this.product_size_col_width, maxWidth : this.product_size_col_width}}>사이즈</th>
                                <th scope="col" style={{width : this.product_price_col_width, maxWidth : this.product_price_col_width}}>상품금액</th>
                                <th scope="col" style={{width : this.returned_number_col_width, maxWidth : this.returned_number_col_width}}>반품번호</th>
                                <th scope="col" style={{width : this.returned_date_col_width, maxWidth : this.returned_date_col_width}}>반품요청일</th>
                                <th scope="col" style={{width : this.returned_quantity_col_width, maxWidth : this.returned_quantity_col_width}}>수량</th>
                                <th scope="col" style={{width : this.returned_status_col_width, maxWidth : this.returned_status_col_width}}>진행상태</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.returned_table_item_list}
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
