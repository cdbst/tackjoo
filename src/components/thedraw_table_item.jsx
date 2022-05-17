class TheDrawTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
        this.onPopAccountInfo = this.onPopAccountInfo.bind(this);
        this.getDrawResultFontColor = this.getDrawResultFontColor.bind(this);
        this.getAccountInfoTag = this.getAccountInfoTag.bind(this);
        this.onClickProductImg = this.onClickProductImg.bind(this);
        this.onCreateQuickTask = this.onCreateQuickTask.bind(this);

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickGoLinkBtn(){
        window.electron.openExternalWebPage(this.props.draw_item.product_link);
    }

    getAccountInfoTag(){
        
        const id_btn_cpy_email = "button-copy-thedraw-item-email-" + this.props.draw_item._id;
        const id_btn_cpy_pwd = "button-copy-thedraw-item-pwd-" + this.props.draw_item._id;

        const email = this.props.draw_item.account_email;
        const pwd = this.props.draw_item.account_pwd;

        const on_click_copy_btn = function(value){
            Index.g_sys_msg_q.enqueue('알림', '클립보드에 저장되었습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);
            window.electron.writeTextToClipboard(value);
        }

        const on_click_copy_btn_email = on_click_copy_btn.bind(null, email);
        const on_click_copy_btn_pwd = on_click_copy_btn.bind(null, pwd);

        return(
            <div>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" value={email} aria-describedby={id_btn_cpy_email} disabled/>
                    <button className="btn btn-primary btn-outline-secondary" type="button" id={id_btn_cpy_email} onClick={on_click_copy_btn_email}>복사</button>
                </div>
                <div className="input-group mb-3">
                    <input type="password" className="form-control" value={pwd} aria-describedby={id_btn_cpy_pwd} disabled/>
                    <button className="btn btn-primary btn-outline-secondary" type="button" id={id_btn_cpy_pwd} onClick={on_click_copy_btn_pwd}>복사</button>
                </div>
            </div>
        );
    }

    onCreateQuickTask(){
        this.props.h_on_create_task(this.props.draw_item.product_link, this.props.draw_item.account_email);
    }

    onPopAccountInfo(){
        Index.g_prompt_modal.popModal('계정 정보', this.getAccountInfoTag(), ()=>{});
    }

    onClickProductImg(){
        window.electron.openExternalWebPage(this.props.draw_item.product_link);
    }

    getDrawResultFontColor(){

        if(this.props.draw_item.draw_result == '당첨'){
            return '#0dcaf0'; //blue
        }else if(this.props.draw_item.draw_result == '미당첨'){
            return '#dc3545'; //red
        }else{
            return '#ffffff'; //white
        }
    }

    render(){

        const draw_result_font_color = this.getDrawResultFontColor();

        return(
            <tr>
                <td style={{width : this.props.image_col_width, maxWidth : this.props.image_col_width}}>
                    <img 
                        className="rounded product-table-item-img curser-pointer" 
                        src={this.props.draw_item.product_img_url} 
                        alt={this.props.draw_item.product_name}
                        onClick={this.onClickProductImg.bind(this)}
                    />
                </td>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div className="cut-text" style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} title={this.props.draw_item.account_email}>{this.props.draw_item.account_email}</div>
                </td>
                <td style={{width : this.props.product_name_col_width, maxWidth : this.props.product_name_col_width}}>
                    <div className="cut-text" style={{width : '21vw', maxWidth : '21vw'}} title={this.props.draw_item.product_name}>{this.props.draw_item.product_name}</div>
                </td>
                <td style={{width : this.props.product_size_col_width, maxWidth : this.props.product_size_col_width}}>
                    <span>{this.props.draw_item.product_size}</span>
                </td>
                <td style={{width : this.props.product_price_col_width, maxWidth : this.props.product_price_col_width}}>
                    <span>{this.props.draw_item.product_price}</span>
                </td>
                <td style={{width : this.props.draw_date_col_width, maxWidth : this.props.draw_date_col_width}}>
                    <span>{common.get_formatted_date_str(this.props.draw_item.draw_date)}</span>
                </td>
                <td style={{width : this.props.draw_result_col_width, maxWidth : this.props.draw_result_col_width}}>
                    <span className='custom-color-text' style={{'--text-color' : draw_result_font_color}}>{this.props.draw_item.draw_result}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" title="당첨 상품 바로가기">
                            <button type="button" className="btn btn-warning" onClick={this.onClickGoLinkBtn.bind(this)}>
                                <img src="./res/img/link.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="당첨 계정 정보 확인">
                            <button type="button" className="btn btn-light" onClick={this.onPopAccountInfo.bind(this)}>
                                <img src="./res/img/info-circle-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table" title="당첨 상품 구매하기">
                            <button type="button" className="btn btn-info" onClick={this.onCreateQuickTask.bind(this)} disabled={this.props.draw_item.draw_result !== '당첨'}>
                                <img src="./res/img/lightning-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}