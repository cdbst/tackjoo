class NewProductTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.getSoldOutStatusFontColor = this.getSoldOutStatusFontColor.bind(this);
        this.onClickCreateTask = this.onClickCreateTask.bind(this);
        this.onClickGoLink = this.onClickGoLink.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);

        this.__mount = false;

        this.state = {
            kream_price : undefined
        }
    }

    componentDidMount(){
        this.__mount = true;
        window.electron.getKreamTradePrice(this.props.product_info, (err, recently_trade_price)=>{

            if(err) return;

            this.setState(_ => ({
                kream_price : recently_trade_price
            }));
        });
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    getSoldOutStatusFontColor(){
        return this.props.product_info.soldout ? '#dc3545' : '#0dcaf0';
    }

    onClickCreateTask(){
        this.props.h_on_create_task(this.props.product_info);
    }

    onClickGoLink(){
        window.electron.openExternalWebPage(this.props.product_info.url);
    }

    onClickRemove(){
        this.props.h_on_remove(this.props.product_info._id)
    }

    render(){

        return(
            <tr>
                <td style={{width : this.props.image_col_width, maxWidth : this.props.image_col_width}}>
                    <img ref={this.ref_product_img} className="rounded new-product-table-item-img" src={this.props.product_info.img_url} alt={this.props.product_info.name}/>
                </td>
                <td style={{width : this.props.name_col_width, maxWidth : this.props.name_col_width}}>
                    <div className="cut-text" style={{width : '21vw', maxWidth : '21vw'}} title={this.props.product_info.name}>{this.props.product_info.name}</div>
                </td>
                <td style={{width : this.props.price_col_width, maxWidth : this.props.price_col_width}}>
                    <span>{this.props.product_info.price}</span>
                </td>
                <td style={{width : this.props.kream_price_col_width, maxWidth : this.props.kream_price_col_width}}>
                    <span>{this.state.kream_price === undefined ? '확인불가' : this.state.kream_price}</span>
                </td>
                <td style={{width : this.props.price_gap_col_width, maxWidth : this.props.price_gap_col_width}}>
                    <span></span>
                </td>
                <td style={{width : this.props.release_date_col_width, maxWidth : this.props.release_date_col_width}}>
                    <span>{common.get_formatted_date_str(this.props.product_info.released_date, true)}</span>
                </td>
                <td style={{width : this.props.soldout_status_col_width, maxWidth : this.props.soldout_status_col_width}}>
                    <span className='custom-color-text' style={{'--text-color' : this.getSoldOutStatusFontColor()}}>{this.props.product_info.soldout ? '품절' : '구매가능'}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-info" onClick={this.onClickCreateTask.bind(this)}>
                                <img src="./res/img/lightning-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.onClickGoLink.bind(this)}>
                                <img src="./res/img/link.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" onClick={this.onClickRemove.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}