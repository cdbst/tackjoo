class ContentsReturnable extends React.Component {

    el_input_select_all = 'input-select-returnable-all';
    el_id_returnable_request_modal = 'returnable-request-modal';

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.onClickClenup = this.onClickClenup.bind(this);
        this.onClickSelectedReturn = this.onClickSelectedReturn.bind(this);
        this.onClickLoad = this.onClickLoad.bind(this);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.setContents = this.setContents.bind(this);
        this.clearContents = this.clearContents.bind(this);
        this.setFilters = this.setFilters.bind(this);
        this.requestReturn = this.requestReturn.bind(this);
        this.onSelectChanged = this.onSelectChanged.bind(this);
        this.onChangeSelectAll = this.onChangeSelectAll.bind(this);
        this.setSelectAllSwitch = this.setSelectAllSwitch.bind(this);
        this.onSubmitReturnable = this.onSubmitReturnable.bind(this);

        this.pushSelectedReturnableInfoList = this.pushSelectedReturnableInfoList.bind(this);
        this.popSelectedReturnableInfoList = this.popSelectedReturnableInfoList.bind(this);
        this.updateSelectAllInput = this.updateSelectAllInput.bind(this);

        this.returnable_info_list = [];
        this.__selected_returnable_info_id = [];

        this.state = {
           returnable_table_item_list : [],
           opt_list_product_name : [],
           opt_list_account_email : [],
           opt_list_order_date : [],
        };

        this.__ref_sel_product_name = React.createRef();
        this.__ref_sel_account_name = React.createRef();
        this.__ref_sel_order_date = React.createRef();
        this.__ref_load_btn = React.createRef();

        this.__mount = false;
        this.__setupColumnsWidth();
    }

    __setupColumnsWidth(){

        this.account_col_width = 240;
        this.product_size_col_width = 100;
        this.order_price_col_width = 140;
        this.order_date_col_width = 120;
        this.actions_col_width = 180;
        this.product_img_col_width = 70;
        this.product_model_id_col_width = 120;
        this.order_number_col_width = 200;
        this.returnable_quantity_col_width = 60;
        this.select_col_width = 60;

        this.product_name_col_width = 'calc( 100% - ' + (
            this.product_model_id_col_width + 
            this.product_img_col_width + 
            this.account_col_width + 
            this.order_date_col_width + 
            this.actions_col_width + 
            this.product_size_col_width + 
            this.order_price_col_width + 
            this.order_number_col_width +
            this.returnable_quantity_col_width + 
            this.select_col_width) + 'px)';
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

    onClickSelectedReturn(){
        if(this.__selected_returnable_info_id.length === 0) return;
        const selected_returnable_info_list = this.returnable_info_list.filter((returnable_info)=> this.__selected_returnable_info_id.includes(returnable_info._id));
        this.requestReturn(selected_returnable_info_list);
    }

    onClickLoad(){

        this.__ref_load_btn.current.setLoadingStatus(true);

        Index.g_sys_msg_q.enqueue('안내', '서버로부터 반품 가능 상품들을 읽어옵니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

        window.electron.loadReturnableInfoList((err, returnable_info_list) =>{

            this.__ref_load_btn.current.setLoadingStatus(false);

            if(err) Index.g_sys_msg_q.enqueue('경고', err, ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
            if(returnable_info_list.length == 0) return;
            Index.g_sys_msg_q.enqueue('안내', '반품 가능 상품들을 읽어왔습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            this.returnable_info_list = returnable_info_list;
            
            this.clearContents(()=>{
                this.setFilters(this.returnable_info_list);
                this.setContents(this.returnable_info_list);
            });
        });
    }

    setFilters(returnable_info_list){

        let product_name_list = common.getValuesFromObjList(returnable_info_list, 'product_name');
        product_name_list.unshift('');

        let account_email_list = common.getValuesFromObjList(returnable_info_list, 'account_email');
        account_email_list.unshift('');

        let order_date_list = common.getValuesFromObjList(returnable_info_list, 'order_date');
        order_date_list.sort((a, b)=>{ 
            if(a > b) return -1;
            else if(a < b) return 1;
            else return 0;
        });
        order_date_list = order_date_list.map((date)=> common.get_formatted_date_str(date));
        order_date_list = [...new Set(order_date_list)];
        order_date_list.unshift('');

        this.setState({
            opt_list_product_name : product_name_list,
            opt_list_account_email : account_email_list,
            opt_list_order_date : order_date_list,
        }, () => {
            this.__ref_sel_product_name.current.setValue('');
            this.__ref_sel_account_name.current.setValue('');
            this.__ref_sel_order_date.current.setValue('');
        });
    }

    setContents(returnable_info_list){
        
        let returnable_table_item_list = this.__getTableItems(returnable_info_list);

        this.setState(_ => ({
            returnable_table_item_list : returnable_table_item_list,
        }));
    }

    clearContents(__callback){

        this.__selected_returnable_info_id = [];
        document.getElementById(this.el_input_select_all).checked = false;
        
        this.setState({
            returnable_table_item_list : [],
            opt_list_product_name : [],
            opt_list_account_email : [],
            opt_list_order_date : [],
        }, () => {
            this.__ref_sel_product_name.current.setValue('');
            this.__ref_sel_account_name.current.setValue('');
            this.__ref_sel_order_date.current.setValue('');
            if(__callback)__callback();
        });
    }

    onChangeOption(){
        
        //현재 선택된 모든 항목들을 선택하지 않은 상태로 변경시킨다.
        this.setSelectAllSwitch(false);
        
        const cur_sel_product_name = this.__ref_sel_product_name.current.getSelectedOptionValue();
        const cur_sel_account_email = this.__ref_sel_account_name.current.getSelectedOptionValue();
        const cur_sel_order_date = this.__ref_sel_order_date.current.getSelectedOptionValue();

        const filtered_returnable_info_list = this.returnable_info_list.filter((returnable_info) =>{
            if( (cur_sel_product_name == '' || cur_sel_product_name == returnable_info.product_name) &&
                (cur_sel_account_email == '' || cur_sel_account_email == returnable_info.account_email) &&
                (cur_sel_order_date == '' || cur_sel_order_date == common.get_formatted_date_str(returnable_info.order_date))
            ){
                return true;
            }else{
                return false;
            }
        });

        this.setContents(filtered_returnable_info_list);
    }

    __getTableItems(returnable_info_list){

        return returnable_info_list.map((returnable_info) =>
            <ReturnableTableItem
                ref = {React.createRef()}
                account_col_width = {this.account_col_width}
                product_size_col_width = {this.product_size_col_width}
                order_price_col_width = {this.order_price_col_width}
                order_number_col_width = {this.order_number_col_width}
                order_date_col_width = {this.order_date_col_width}
                actions_col_width = {this.actions_col_width}
                product_name_col_width = {this.product_name_col_width}
                product_img_col_width = {this.product_img_col_width}
                product_model_id_col_width = {this.product_model_id_col_width}
                select_col_width = {this.select_col_width}
                returnable_info = {returnable_info}
                returnable_quantity_col_width = {this.returnable_quantity_col_width}
                h_on_request_return = {this.requestReturn.bind(this)}
                h_select_changed = {this.onSelectChanged.bind(this)}
                key={returnable_info._id}
            />
        );
    }

    onSubmitReturnable(returnable_info_list){
        console.log(returnable_info_list);
    }

    requestReturn(returnable_info_list){

        const el_modal = document.getElementById(this.el_id_returnable_request_modal);
        el_modal.returnable_info_list = returnable_info_list;

        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.show();

        //TODO 반품 다하고 __selected_returnable_info_id 초기화 작업 필요할수 있음.
    }

    pushSelectedReturnableInfoList(returnable_info_id){
        if(this.__selected_returnable_info_id.includes(returnable_info_id) === false) this.__selected_returnable_info_id.push(returnable_info_id);
    }

    popSelectedReturnableInfoList(returnable_info_id){
        this.__selected_returnable_info_id = this.__selected_returnable_info_id.filter((_returnable_info_id) => _returnable_info_id !== returnable_info_id);
    }

    onSelectChanged(returnable_info_id, status){
        
        if(status) this.pushSelectedReturnableInfoList(returnable_info_id);
        else this.popSelectedReturnableInfoList(returnable_info_id);

        this.updateSelectAllInput();
    }

    updateSelectAllInput(){
        const num_of_returnable = this.state.returnable_table_item_list.length;
        document.getElementById(this.el_input_select_all).checked = num_of_returnable === this.__selected_returnable_info_id.length;
    }

    onChangeSelectAll(){
        const is_selected = document.getElementById(this.el_input_select_all).checked;
        for(var i = 0; i < this.state.returnable_table_item_list.length; i++){
            this.state.returnable_table_item_list[i].ref.current.setSelectStatus(is_selected);
        }
    }

    setSelectAllSwitch(value){
        document.getElementById(this.el_input_select_all).checked = value;
        for(var i = 0; i < this.state.returnable_table_item_list.length; i++){
            this.state.returnable_table_item_list[i].ref.current.setSelectStatus(value);
        }
    }

    render() {

        return (
            <div className="tab-pane fade" id="returnable" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.RETURNABLE}>
                <div className="container-fluid">
                    <ReturnableRequestModal id={this.el_id_returnable_request_modal} h_submit_returnable={this.onSubmitReturnable.bind(this)}/>
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-2">
                            <h4 className="contents-title">반품신청</h4>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_account_name} label="계정" options={this.state.opt_list_account_email} h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-4">
                            <LabelSelect ref={this.__ref_sel_product_name} label="상품" options={this.state.opt_list_product_name} label_col_class="col-md-2" select_col_class="col-md-10" h_on_change={this.onChangeOption.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <LabelSelect ref={this.__ref_sel_order_date} label="주문일시" options={this.state.opt_list_order_date} h_on_change={this.onChangeOption.bind(this)}/>
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
                                <th scope="col" style={{width : this.order_price_col_width, maxWidth : this.order_price_col_width}}>주문금액</th>
                                <th scope="col" style={{width : this.order_number_col_width, maxWidth : this.order_number_col_width}}>주문번호</th>
                                <th scope="col" style={{width : this.order_date_col_width, maxWidth : this.order_date_col_width}}>주문일시</th>
                                <th scope="col" style={{width : this.returnable_quantity_col_width, maxWidth : this.returnable_quantity_col_width}}>수량</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                                <th scope="col" style={{width : this.select_col_width, maxWidth : this.select_col_width}}>
                                    <div className="form-switch">
                                        <input 
                                            id={this.el_input_select_all} 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            onChange={this.onChangeSelectAll.bind(this)}
                                            disabled={this.returnable_info_list.length === 0}    
                                        />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.returnable_table_item_list}
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
                            <button type="button" className="btn btn-light btn-footer-inside" onClick={this.onClickSelectedReturn.bind(this)}>
                                <img src="./res/img/product-return.png" style={{width:24, height:24}}/> 선택반품
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
