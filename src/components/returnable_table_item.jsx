class ReturnableTableItem extends React.Component {

    constructor(props) {
        super(props);

        // this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
        // this.onClickKreamLinkBtn = this.onClickKreamLinkBtn.bind(this);
        // this.onClickCancelOrder = this.onClickCancelOrder.bind(this);
        this.saveTableItemText = this.saveTableItemText.bind(this);
        this.onChangeSelect = this.onChangeSelect.bind(this);
        this.setSelectStatus = this.setSelectStatus.bind(this);

        this.__ref_cancel_order_btn = React.createRef();
        this.state = {
            selected : false
        };

        this.el_input_select = 'el-input-select-' + this.props.returnable_info._id;

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    // onClickGoLinkBtn(){
    //     window.electron.openExternalWebPage(this.props.returnable_info.url);
    // }

    // onClickKreamLinkBtn(){
    //     window.electron.getKreamProductInfo(this.props.returnable_info.model_id, (err, kream_product_info)=>{

    //         if(err){
    //             Index.g_sys_msg_q.enqueue('에러', `해당 상품을 크림에서 찾을수 없습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
    //             return;
    //         }

    //         window.electron.openExternalWebPage(kream_product_info.url);
    //     });
    // }


    saveTableItemText(text){
        Index.g_sys_msg_q.enqueue('알림', `클립보드에 저장되었습니다. (${text})`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 2000);
        window.electron.writeTextToClipboard(text);
    }

    onChangeSelect(){
        const is_selected = document.getElementById(this.el_input_select).checked;
        this.setState({ selected: is_selected});
        this.props.h_select_changed(this.props.returnable_info._id, is_selected);
    }

    setSelectStatus(value){
        document.getElementById(this.el_input_select).checked = value;
        this.setState({ selected: value});
        this.props.h_select_changed(this.props.returnable_info._id, value);
    }

    render(){

        // const formated_order_date = common.get_formatted_date_str(this.props.returnable_info.date);

        // this.order_number_col_width = 200;
        // this.select_col_width = 60;

        return(
            <tr>
                <td style={{width : this.props.product_img_col_width, maxWidth : this.props.product_img_col_width}}>
                    {/* <img 
                        className="rounded product-table-item-img curser-pointer" 
                        src={this.props.returnable_info.img_url} 
                        alt={this.props.returnable_info.name}
                        onClick={this.onClickGoLinkBtn.bind(this)}
                    /> */}
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} 
                        // title={this.props.returnable_info.account_email}
                        onClick={this.saveTableItemText.bind(this, this.props.returnable_info.account_email)}
                    >
                        pakd123@test.com
                    </div>
                </td>
                <td style={{width : this.props.product_name_col_width, maxWidth : this.props.product_name_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : '21vw', maxWidth : '21vw'}} 
                        // title={this.props.returnable_info.name}
                        onClick={this.saveTableItemText.bind(this, this.props.returnable_info.name)}
                    >
                        에어조던4 테스트 상품
                    </div>
                </td>
                <td style={{width : this.props.product_model_id_col_width, maxWidth : this.props.product_model_id_col_width}}>
                    <div className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returnable_info.model_id)}>DDDD-111</div>
                </td>
                <td style={{width : this.props.product_size_col_width, maxWidth : this.props.product_size_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returnable_info.size)}>335</span>
                </td>
                <td style={{width : this.props.order_price_col_width, maxWidth : this.props.order_price_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returnable_info.price)}>112,000</span>
                </td>
                <td style={{width : this.props.order_number_col_width, maxWidth : this.props.order_number_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : this.props.order_number_col_width, maxWidth : this.props.order_number_col_width}} 
                        // title={this.props.returnable_info.account_email}
                        onClick={this.saveTableItemText.bind(this, this.props.returnable_info.account_email)}
                    >
                        1234455555555555555552222222123
                    </div>
                </td>
                <td style={{width : this.props.order_date_col_width, maxWidth : this.props.order_date_col_width}}>
                    {/* <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, formated_order_date)}>{formated_order_date}</span> */}
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, 2022-30-30)}>2022-30-30</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title="크림 바로가기">
                            {/* <button type="button" className="btn btn-warning" onClick={this.onClickKreamLinkBtn.bind(this)}>
                                <img src="./res/img/kream-logo.png" style={{width:24, height:24}}/>
                            </button> */}
                            <button type="button" className="btn btn-warning">
                                <img src="./res/img/kream-logo.png" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="반품 신청">

                        </div>
                    </div>
                </td>
                <td style={{width : this.props.select_col_width, maxWidth : this.props.select_col_width}} >
                    <div className="form-switch">
                        <input id={this.el_input_select} type="checkbox" className="form-check-input" onChange={this.onChangeSelect.bind(this)}/>
                    </div>
                </td>
            </tr>
        );
    }
}