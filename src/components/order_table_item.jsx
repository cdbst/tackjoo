class OrderTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
        this.onClickCancelOrder = this.onClickCancelOrder.bind(this);
        this.getDrawResultFontColor = this.getDrawResultFontColor.bind(this);

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

    onClickCancelOrder(){
        
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
                <td style={{width : this.props.checkout_date_col_width, maxWidth : this.props.checkout_date_col_width}}>
                    <span>{common.get_formatted_date_str(this.props.draw_item.draw_date)}</span>
                </td>
                <td style={{width : this.props.progress_status_col_width, maxWidth : this.props.progress_status_col_width}}>
                    <span className='custom-color-text' style={{'--text-color' : draw_result_font_color}}>{this.props.draw_item.draw_result}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.onClickGoLinkBtn.bind(this)}>
                                <img src="./res/img/link.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-info" onClick={this.onClickCancelOrder.bind(this)}>
                                <img src="./res/img/info-circle-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}