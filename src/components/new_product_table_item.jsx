class NewProductTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.getSoldOutStatusFontColor = this.getSoldOutStatusFontColor.bind(this);
        this.getKreamPriceFontColor = this.getKreamPriceFontColor.bind(this);
        this.onClickCreateTask = this.onClickCreateTask.bind(this);
        this.onClickGoKreamLink = this.onClickGoKreamLink.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.onClickProductImg = this.onClickProductImg.bind(this);
        this.onDBClickTableItem = this.onDBClickTableItem.bind(this);

        this.__mount = false;

        this.state = {
            kream_product_info : undefined
        }
    }

    componentDidMount(){
        this.__mount = true;
        window.electron.getKreamProductInfo(this.props.product_info, (err, kream_product_info)=>{

            if(err) return;

            this.setState(_ => ({
                kream_product_info : kream_product_info
            }));
        });
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    getSoldOutStatusFontColor(){
        return this.props.product_info.soldout ? '#dc3545' : '#0dcaf0';
    }

    getKreamPriceFontColor(){
        return this.state.kream_product_info === undefined ? '#dc3545' : '#ffffff';
    }

    onClickCreateTask(){
        this.props.h_on_create_task(this.props.product_info);
    }

    onClickGoKreamLink(){
        if(this.state.kream_product_info === undefined) return undefined;
        window.electron.openExternalWebPage(this.state.kream_product_info.url);
    }

    onClickRemove(){
        this.props.h_on_remove(this.props.product_info._id)
    }

    onClickProductImg(){
        if(this.props.product_info.url === undefined || this.props.product_info.url === '') return;
        window.electron.openExternalWebPage(this.props.product_info.url);
    }

    onDBClickTableItem(){
        if(this.props.product_info.soldout){
            Index.g_sys_msg_q.enqueue('에러', `품절된 상품은 구매하지 못합니다.`, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 1500);
            return;
        }
        this.props.h_on_create_task(this.props.product_info);
    }

    render(){

        const kream_price_str = this.state.kream_product_info === undefined ? '정보없음' : this.state.kream_product_info.price;
        const kream_interest_str = this.state.kream_product_info === undefined ? '' : this.state.kream_product_info.interest;

        let price_gap_str = '';
        let price_gap = 0;
        
        if(this.state.kream_product_info){
            price_gap = common.getPriceGap(this.state.kream_product_info.price, this.props.product_info.price);
            price_gap_str = new Intl.NumberFormat('ko-KR').format(price_gap);
            let yield_percent =  (price_gap / common.getNumberByCurrencyStr(this.props.product_info.price)) * 100;
            yield_percent = yield_percent.toFixed(1);
            price_gap_str = `${price_gap_str}(${yield_percent}%)`;
        }

        const price_gap_str_font_color = price_gap > 0 ? '#0dcaf0' : '#dc3545';

        return(
            <tr onDoubleClick={this.onDBClickTableItem.bind(this)}>
                <td style={{width : this.props.image_col_width, maxWidth : this.props.image_col_width}}>
                    <img 
                        className="rounded product-table-item-img" 
                        src={this.props.product_info.img_url} 
                        alt={this.props.product_info.name}
                        onClick={this.onClickProductImg.bind(this)}
                        style={{cursor: 'pointer'}}
                    />
                </td>
                <td style={{width : this.props.name_col_width, maxWidth : this.props.name_col_width}}>
                    <div className="cut-text" style={{width : '21vw', maxWidth : '21vw'}} title={this.props.product_info.name}>{this.props.product_info.name}</div>
                </td>
                <td style={{width : this.props.model_id_col_width, maxWidth : this.props.model_id_col_width}}>
                    <span >{this.props.product_info.model_id}</span>
                </td>
                <td style={{width : this.props.price_col_width, maxWidth : this.props.price_col_width}}>
                    <span >{this.props.product_info.price}</span>
                </td>
                <td style={{width : this.props.kream_price_col_width, maxWidth : this.props.kream_price_col_width}}>
                    <span className='custom-color-text' style={{'--text-color' : this.getKreamPriceFontColor()}}>{kream_price_str}</span>
                </td>
                <td style={{width : this.props.price_gap_col_width, maxWidth : this.props.price_gap_col_width}}>
                    <span className='custom-color-text' style={{'--text-color' : price_gap_str_font_color}}>{price_gap_str}</span>
                </td>
                <td style={{width : this.props.kream_interest_col_width, maxWidth : this.props.kream_interest_col_width}}>
                    <span >{kream_interest_str}</span>
                </td>
                <td style={{width : this.props.release_date_col_width, maxWidth : this.props.release_date_col_width}}>
                    <span>{common.get_formatted_date_str(this.props.product_info.released_date, true)}</span>
                </td>
                <td style={{width : this.props.soldout_status_col_width, maxWidth : this.props.soldout_status_col_width}}>
                    <span className='custom-color-text' style={{'--text-color' : this.getSoldOutStatusFontColor()}}>{this.props.product_info.soldout ? '품절' : '구매가능'}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table" >
                            <button type="button" className="btn btn-info" onClick={this.onClickCreateTask.bind(this)} disabled={this.props.product_info.soldout}>
                                <img src="./res/img/lightning-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.onClickGoKreamLink.bind(this)} disabled={this.state.kream_product_info === undefined}>
                                <img src="./res/img/kream-logo.png" style={{width:24, height:24}}/>
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