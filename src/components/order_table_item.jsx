class OrderTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
        this.onClickKreamLinkBtn = this.onClickKreamLinkBtn.bind(this);
        this.onClickCancelOrder = this.onClickCancelOrder.bind(this);

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
        Index.g_prompt_modal.popModal('경고', <p>정말로 주문을 취소하시겠 습니까?</p>, (is_ok)=>{
            if(is_ok == false) return;

            window.electron.cancelOrder(this.props.order_info, (error, result) =>{
                if(error){
                    Index.g_sys_msg_q.enqueue('에러', `주문을 취소하는 과정에서 알 수 없는 오류가 발생했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                    return;
                }else if(result ===  false){
                    Index.g_sys_msg_q.enqueue('에러', `주문 취소 요청이 실패했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                    return;
                }

                Index.g_sys_msg_q.enqueue('알림', `성공적으로 주문을 취소했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
                //TODO 테이블 업데이트.
            });

        });
    }

    render(){

        return(
            <tr>
                <td style={{width : this.props.product_img_col_width, maxWidth : this.props.product_img_col_width}}>
                    <img 
                        className="rounded product-table-item-img" 
                        src={this.props.order_info.img_url} 
                        alt={this.props.order_info.name}
                        onClick={this.onClickGoLinkBtn.bind(this)}
                        style={{cursor: 'pointer'}}
                    />
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div className="cut-text" style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} title={this.props.order_info.account_email}>{this.props.order_info.account_email}</div>
                </td>
                <td style={{width : this.props.product_name_col_width, maxWidth : this.props.product_name_col_width}}>
                    <div className="cut-text" style={{width : '21vw', maxWidth : '21vw'}} title={this.props.order_info.name}>{this.props.order_info.name}</div>
                </td>
                <td style={{width : this.props.product_model_id_col_width, maxWidth : this.props.product_model_id_col_width}}>
                    <div >{this.props.order_info.model_id}</div>
                </td>
                <td style={{width : this.props.product_size_col_width, maxWidth : this.props.product_size_col_width}}>
                    <span>{this.props.order_info.size}</span>
                </td>
                <td style={{width : this.props.product_price_col_width, maxWidth : this.props.product_price_col_width}}>
                    <span>{this.props.order_info.price}</span>
                </td>
                <td style={{width : this.props.order_date_col_width, maxWidth : this.props.order_date_col_width}}>
                    <span>{common.get_formatted_date_str(this.props.order_info.date)}</span>
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
                        <div className="float-start button-wrapper-inner-table" title="주문 취소하기">
                            <button type="button" className="btn btn-danger" onClick={this.onClickCancelOrder.bind(this)} disabled={this.props.order_info.is_cancelable === false}>
                                <img src="./res/img/x-circle-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}