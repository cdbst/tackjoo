class OrderTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
        this.onClickKreamLinkBtn = this.onClickKreamLinkBtn.bind(this);
        this.onClickCancelOrder = this.onClickCancelOrder.bind(this);
        this.saveTableItemText = this.saveTableItemText.bind(this);

        this.__ref_cancel_order_btn = React.createRef();

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickGoLinkBtn(){
        window.electron.openExternalWebPage(this.props.order_info.url);
    }

    onClickKreamLinkBtn(){
        window.electron.getKreamProductInfo(this.props.order_info.model_id, (err, kream_product_info)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', `해당 상품을 크림에서 찾을수 없습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
                return;
            }

            window.electron.openExternalWebPage(kream_product_info.url);
        });
    }

    onClickCancelOrder(){
        Index.g_prompt_modal.popModal('경고', <p>{this.props.order_info.account_email}로 주문한 {this.props.order_info.name}의 구매를 정말로 취소하시겠 습니까?</p>, (is_ok)=>{
            if(is_ok == false) return;

            this.__ref_cancel_order_btn.current.setLoadingStatus(true);
            Index.g_sys_msg_q.enqueue('알림', `${this.props.order_info.account_email} 계정으로 주문한 ${this.props.order_info.name} 상품의 주문 취소를 요청합니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            window.electron.cancelOrder(this.props.order_info, (error, result) =>{

                this.__ref_cancel_order_btn.current.setLoadingStatus(false);

                if(error){
                    Index.g_sys_msg_q.enqueue('에러', `주문을 취소하는 과정에서 알 수 없는 오류가 발생했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                    return;
                }else if(result ===  false){
                    Index.g_sys_msg_q.enqueue('에러', `주문 취소 요청이 실패했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                    return;
                }

                Index.g_sys_msg_q.enqueue('알림', `${this.props.order_info.account_email} 계정으로 주문한 ${this.props.order_info.name} 상품의 주문을 성공적으로 취소했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

                const updated_order_info = _.clone(this.props.order_info);
                updated_order_info.is_cancelable = false;
                updated_order_info.status = '취소완료';
                this.props.h_update_order_info(updated_order_info);
            });

        });
    }

    saveTableItemText(text){
        Index.g_sys_msg_q.enqueue('알림', `클립보드에 저장되었습니다. (${text})`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 2000);
        window.electron.writeTextToClipboard(text);
    }

    render(){

        const cancel_order_tooltip = this.props.order_info.is_cancelable ? '주문 취소하기' : '결제 완료단계에서만 주문 취소가 가능합니다';
        const formated_order_date = common.get_formatted_date_str(this.props.order_info.date);

        return(
            <tr>
                <td style={{width : this.props.product_img_col_width, maxWidth : this.props.product_img_col_width}}>
                    <img 
                        className="rounded product-table-item-img curser-pointer" 
                        src={this.props.order_info.img_url} 
                        alt={this.props.order_info.name}
                        onClick={this.onClickGoLinkBtn.bind(this)}
                    />
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} 
                        title={this.props.order_info.account_email}
                        onClick={this.saveTableItemText.bind(this, this.props.order_info.account_email)}>
                        {this.props.order_info.account_email}
                    </div>
                </td>
                <td style={{width : this.props.product_name_col_width, maxWidth : this.props.product_name_col_width}}>
                    <div 
                        className="cut-text curser-pointer" 
                        style={{width : '21vw', maxWidth : '21vw'}} 
                        title={this.props.order_info.name}
                        onClick={this.saveTableItemText.bind(this, this.props.order_info.name)}>
                        {this.props.order_info.name}
                    </div>
                </td>
                <td style={{width : this.props.product_model_id_col_width, maxWidth : this.props.product_model_id_col_width}}>
                    <div className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.order_info.model_id)}>{this.props.order_info.model_id}</div>
                </td>
                <td style={{width : this.props.product_size_col_width, maxWidth : this.props.product_size_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.order_info.size)}>{this.props.order_info.size}</span>
                </td>
                <td style={{width : this.props.product_price_col_width, maxWidth : this.props.product_price_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, this.props.order_info.price)}>{this.props.order_info.price}</span>
                </td>
                <td style={{width : this.props.order_date_col_width, maxWidth : this.props.order_date_col_width}}>
                    <span className="curser-pointer" onClick={this.saveTableItemText.bind(this, formated_order_date)}>{formated_order_date}</span>
                </td>
                <td style={{width : this.props.order_status_col_width, maxWidth : this.props.order_status_col_width}}>
                    <span >{this.props.order_info.status}</span>
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
                                ref={this.__ref_cancel_order_btn}
                                h_on_click={this.onClickCancelOrder.bind(this)}
                                btn_class={"btn-danger"}
                                img_src={"./res/img/x-circle-fill.svg"}
                                disabled={this.props.order_info.is_cancelable === false}
                            />
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}