class ReturnedTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickKreamLinkBtn = this.onClickKreamLinkBtn.bind(this);
        this.saveTableItemText = this.saveTableItemText.bind(this);
        this.onClickCancelReturnBtn = this.onClickCancelReturnBtn.bind(this);

        this.__ref_cancel_return_btn = React.createRef();
        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickKreamLinkBtn(){
        window.electron.getKreamProductInfo(this.props.returned_info.product_model_id, (err, kream_product_info)=>{

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

    onClickCancelReturnBtn(){

        Index.g_prompt_modal.popModal('경고', <p>{this.props.returned_info.account_email} 계정으로 주문한 {this.props.returned_info.product_name}의 반품 요청을 정말로 취소합니까?</p>, (is_ok)=>{

            if(is_ok == false) return;

            this.__ref_cancel_return_btn.current.setLoadingStatus(true);
            Index.g_sys_msg_q.enqueue('알림', `${this.props.returned_info.account_email} 계정으로 주문한 ${this.props.returned_info.product_name} 상품의 반품 요청 취소를 요청합니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            window.electron.cancelReturn(this.props.returned_info, (error, result) =>{

                this.__ref_cancel_return_btn.current.setLoadingStatus(false);

                if(error){
                    Index.g_sys_msg_q.enqueue('에러', `반품을 취소하는 과정에서 알 수 없는 오류가 발생했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                    return;
                }else if(result ===  false){
                    Index.g_sys_msg_q.enqueue('에러', `반품 취소 요청이 실패했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                    return;
                }

                Index.g_sys_msg_q.enqueue('알림', `${this.props.returned_info.account_email} 계정으로 주문한 ${this.props.returned_info.product_name} 상품의 반품 취소 요청이 성공했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

                const updated_returned_info = _.clone(this.props.returned_info);
                updated_returned_info.is_cancelable = false;
                updated_returned_info.status = '반품취소완료';
                this.props.h_update_returned_info(updated_returned_info);
            });

        });
    }

    render(){

        const formated_returned_date = common.get_formatted_date_str(this.props.returned_info.returned_date);
        const cancel_order_tooltip = this.props.returned_info.is_cancelable ? '반품 취소하기' : '반품신청중 단계에서만 주문 취소가 가능합니다';

        return(
            <tr>
                <td style={{width : this.props.product_img_col_width, maxWidth : this.props.product_img_col_width}}>
                    <img 
                        className="rounded product-table-item-img" 
                        src={this.props.returned_info.product_img_url} 
                        alt={this.props.returned_info.product_name}
                    />
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} 
                        title={this.props.returned_info.account_email}
                        onClick={this.saveTableItemText.bind(this, this.props.returned_info.account_email)}
                    >
                        {this.props.returned_info.account_email}
                    </div>
                </td>
                <td style={{width : this.props.product_name_col_width, maxWidth : this.props.product_name_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : '21vw', maxWidth : '21vw'}} 
                        title={this.props.returned_info.product_name}
                        onClick={this.saveTableItemText.bind(this, this.props.returned_info.product_name)}
                    >
                        {this.props.returned_info.product_name}
                    </div>
                </td>
                <td style={{width : this.props.product_model_id_col_width, maxWidth : this.props.product_model_id_col_width}}>
                    <div className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returned_info.product_model_id)}>{this.props.returned_info.product_model_id}</div>
                </td>
                <td style={{width : this.props.product_size_col_width, maxWidth : this.props.product_size_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returned_info.product_option)}>{this.props.returned_info.product_option}</span>
                </td>
                <td style={{width : this.props.product_price_col_width, maxWidth : this.props.product_price_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returned_info.product_price)}>{this.props.returned_info.product_price}</span>
                </td>
                <td style={{width : this.props.returned_number_col_width, maxWidth : this.props.returned_number_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : this.props.returned_number_col_width, maxWidth : this.props.returned_number_col_width}} 
                        title={this.props.returned_info.returned_number}
                        onClick={this.saveTableItemText.bind(this, this.props.returned_info.returned_number)}
                    >
                        {this.props.returned_info.returned_number}
                    </div>
                </td>
                <td style={{width : this.props.returned_date_col_width, maxWidth : this.props.returned_date_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, formated_returned_date)}>{formated_returned_date}</span>
                </td>
                <td style={{width : this.props.returned_quantity_col_width, maxWidth : this.props.returned_quantity_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returned_info.returned_quantity)}>{this.props.returned_info.returned_quantity}</span>
                </td>
                <td style={{width : this.props.returned_status_col_width, maxWidth : this.props.returned_status_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.returned_info.returned_status)}>{this.props.returned_info.returned_status}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title="크림 바로가기">
                            <button type="button" className="btn btn-warning" onClick={this.onClickKreamLinkBtn.bind(this)}>
                                <img src="./res/img/kream-logo.png" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title={cancel_order_tooltip}>
                            <LaodingButton
                                ref={this.__ref_cancel_return_btn}
                                h_on_click={this.onClickCancelReturnBtn.bind(this)}
                                btn_class={"btn-danger"}
                                img_src={"./res/img/x-circle-fill.svg"}
                                disabled={this.props.returned_info.is_cancelable === false}
                            />
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}