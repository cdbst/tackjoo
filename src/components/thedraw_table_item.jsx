class TheDrawTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickGoLinkBtn = this.onClickGoLinkBtn.bind(this);
        this.onPopAccountInfo = this.onPopAccountInfo.bind(this);

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickGoLinkBtn(){
        console.log('onClickGoLinkBtn');
    }

    onPopAccountInfo(){
        console.log('onPopAccountInfo');
    }

    render(){

        // account_col_width = {this.account_col_width}
        // product_size_col_width = {this.product_size_col_width}
        // product_price_col_width = {this.product_price_col_width}
        // draw_date_col_width = {this.draw_date_col_width}
        // draw_result_col_width = {this.draw_result_col_width}
        // actions_col_width = {this.actions_col_width}
        // product_col_width = {this.product_col_width}
        // key={draw_item.id}

        // {
        //     account_info : {
        //         email : 'aaaa@gmail.com',
        //         pwd : '123456',
        //         id : common.uuidv4()
        //     },
        //     product_name : 'DUNK AA',
        //     prouduct_size : '230',
        //     prouduct_price : '180,000',
        //     draw_date : '2020-10-11',
        //     draw_result : '당첨',
        //     _id : common.uuidv4()
        // }

        return(
            <tr>
                <td style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}}>
                    <div className="cut-text" style={{width : this.props.account_col_width, maxWidth : this.props.account_col_width}} title={this.props.draw_item.account_info.email}>{this.props.draw_item.account_info.email}</div>
                </td>
                <td style={{width : this.props.product_col_width, maxWidth : this.props.product_col_width}}>
                    <div className="cut-text" style={{width : this.props.product_col_width, maxWidth : this.props.product_col_width}} title={this.props.draw_item.product_name}>{this.props.draw_item.product_name}</div>
                </td>
                <td style={{width : this.props.product_size_col_width, maxWidth : this.props.product_size_col_width}}>
                    <span>{this.props.draw_item.prouduct_size}</span>
                </td>
                <td style={{width : this.props.product_price_col_width, maxWidth : this.props.product_price_col_width}}>
                    <span>{this.props.draw_item.prouduct_price}</span>
                </td>
                <td style={{width : this.props.draw_date_col_width, maxWidth : this.props.draw_date_col_width}}>
                    <span>{this.props.draw_item.draw_date}</span>
                </td>
                <td style={{width : this.props.draw_result_col_width, maxWidth : this.props.draw_result_col_width}}>
                    <span>{this.props.draw_item.draw_result}</span>
                </td>
                <td style={{width : this.props.actions_col_width, maxWidth : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.onClickGoLinkBtn.bind(this)}>
                                <img src="./res/img/link.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-info" onClick={this.onPopAccountInfo.bind(this)}>
                                <img src="./res/img/info-circle-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}