class ReturnableTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickKreamLinkBtn = this.onClickKreamLinkBtn.bind(this);
        this.onClickProductReturn = this.onClickProductReturn.bind(this);
        this.saveTableItemText = this.saveTableItemText.bind(this);
        this.onChangeSelect = this.onChangeSelect.bind(this);
        this.setSelectStatus = this.setSelectStatus.bind(this);

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

    onClickProductReturn(){
        this.props.h_on_request_return([this.props.returnable_info]);
    }

    onClickKreamLinkBtn(){
        window.electron.getKreamProductInfo(this.props.returnable_info.product_model_id, (err, kream_product_info)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', `해당 상품을 크림에서 찾을수 없습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
                return;
            }

            window.electron.openExternalWebPage(kream_product_info.url);
        });
    }


    saveTableItemText(text){
        Index.g_sys_msg_q.enqueue('알림', `클립보드에 저장되었습니다. (${text})`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 2000);
        window.electron.writeTextToClipboard(text);
    }

    onChangeSelect(){
        const is_selected = document.getElementById(this.el_input_select).checked;
        this.setState({ selected: is_selected });
        this.props.h_select_changed(this.props.returnable_info._id, is_selected);
    }

    setSelectStatus(value){
        document.getElementById(this.el_input_select).checked = value;
        this.setState({ selected: value });
        this.props.h_select_changed(this.props.returnable_info._id, value);
    }

    render(){

        const formated_order_date = common.get_formatted_date_str(this.props.returnable_info.order_date);
        const background_color = this.state.selected ? 'rgb(131, 241, 149, 0.36)' : 'transparent';

        return(
            <tr style={{background : background_color}}>
                <td style={{width : this.props.product_img_col_width, maxWidth : this.props.product_img_col_width}}>
                    <img 
                        className="rounded product-table-item-img" 
                        src={this.props.returnable_info.product_img_url} 
                        alt={this.props.returnable_info.product_name}
                    />
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} 
                        title={this.props.returnable_info.account_email}
                        onClick={this.saveTableItemText.bind(this, this.props.returnable_info.account_email)}
                    >
                        {this.props.returnable_info.account_email}
                    </div>
                </td>
                <td style={{width : this.props.product_name_col_width, maxWidth : this.props.product_name_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : '21vw', maxWidth : '21vw'}} 
                        title={this.props.returnable_info.product_name}
                        onClick={this.saveTableItemText.bind(this, this.props.returnable_info.product_name)}
                    >
                        {this.props.returnable_info.product_name}
                    </div>
                </td>
                <td style={{width : this.props.product_model_id_col_width, maxWidth : this.props.product_model_id_col_width}}>
                    <div className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returnable_info.product_model_id)}>{this.props.returnable_info.product_model_id}</div>
                </td>
                <td style={{width : this.props.product_size_col_width, maxWidth : this.props.product_size_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returnable_info.product_option)}>{this.props.returnable_info.product_option}</span>
                </td>
                <td style={{width : this.props.order_price_col_width, maxWidth : this.props.order_price_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returnable_info.order_price)}>{this.props.returnable_info.order_price}</span>
                </td>
                <td style={{width : this.props.order_number_col_width, maxWidth : this.props.order_number_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : this.props.order_number_col_width, maxWidth : this.props.order_number_col_width}} 
                        title={this.props.returnable_info.order_number}
                        onClick={this.saveTableItemText.bind(this, this.props.returnable_info.order_number)}
                    >
                        {this.props.returnable_info.order_number}
                    </div>
                </td>
                <td style={{width : this.props.order_date_col_width, maxWidth : this.props.order_date_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, formated_order_date)}>{formated_order_date}</span>
                </td>
                <td style={{width : this.props.returnable_quantity_col_width, maxWidth : this.props.returnable_quantity_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returnable_info.returnable_quantity)}>{this.props.returnable_info.returnable_quantity}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title="크림 바로가기">
                            <button type="button" className="btn btn-warning" onClick={this.onClickKreamLinkBtn.bind(this)}>
                                <img src="./res/img/kream-logo.png" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="반품 신청">
                            <button type="button" className="btn btn-light" onClick={this.onClickProductReturn.bind(this)}>
                                <img src="./res/img/product-return.png" style={{width:24, height:24}}/>
                            </button>
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