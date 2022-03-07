class OrderTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
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

    onClickCancelOrder(){
        
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
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.onClickGoLinkBtn.bind(this)}>
                                <img src="./res/img/link.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-info" onClick={this.onClickCancelOrder.bind(this)}>
                                <img src="./res/img/x-circle-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}