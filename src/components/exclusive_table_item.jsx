class ExclusiveTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
        this.onCreateTask = this.onCreateTask.bind(this);
        this.onClickKreamLinkBtn = this.onClickKreamLinkBtn.bind(this);

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickGoLinkBtn(){
        window.electron.openExternalWebPage(this.props.product_info.product_link);
    }

    onClickKreamLinkBtn(){
        window.electron.getKreamProductInfo(this.props.product_info.model_id, (err, kream_product_info)=>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', `해당 상품을 크림에서 찾을수 없습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 3000);
                return;
            }

            window.electron.openExternalWebPage(kream_product_info.url);
        });
    }

    onCreateTask(){
        this.props.h_on_create_task(this.props.product_info, this.props.account_email);
    }

    render(){

        return(
            <tr>
                <td style={{width : this.props.image_col_width, maxWidth : this.props.image_col_width}}>
                    <img 
                        className="rounded product-table-item-img curser-pointer" 
                        src={this.props.product_info.img_url} 
                        alt={this.props.product_info.name}
                    />
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div className="cut-text" style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} title={this.props.account_email}>{this.props.account_email}</div>
                </td>
                <td style={{width : this.props.product_name_col_width, maxWidth : this.props.product_name_col_width}}>
                    <div className="cut-text" style={{width : '21vw', maxWidth : '21vw'}} title={this.props.product_info.name}>{this.props.product_info.name}</div>
                </td>
                <td style={{width : this.props.product_model_id_col_width, maxWidth : this.props.product_model_id_col_width}}>
                    <span>{this.props.product_info.model_id}</span>
                </td>
                <td style={{width : this.props.product_price_col_width, maxWidth : this.props.product_price_col_width}}>
                    <span>{this.props.product_info.price}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title="크림 바로가기">
                            <button type="button" className="btn btn-warning" onClick={this.onClickKreamLinkBtn.bind(this)}>
                                <img src="./res/img/kream-logo.png" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="작업 생성하기">
                            <button type="button" className="btn btn-info" onClick={this.onCreateTask.bind(this)}>
                                <img src="./res/img/pencil-square.svg" style={{width:24, height:24}} />
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}