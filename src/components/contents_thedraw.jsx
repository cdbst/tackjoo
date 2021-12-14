
class ContentsTheDraw extends React.Component {

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.onClickClenup = this.onClickClenup.bind(this);
        this.onClickLoad = this.onClickLoad.bind(this);
        this.onChangeAccount = this.onChangeAccount.bind(this);


        this.state = {
           thedraw_item_list : []
        };

        this.__mount = false;
        this.__setupColumnsWidth();

    }

    __setupColumnsWidth(){

        this.account_col_width = 240;
        this.product_size_col_width = 120;
        this.product_price_col_width = 180;
        this.draw_date_col_width = 240;
        this.draw_result_col_width = 120;
        this.actions_col_width = 240;
        this.product_col_width = 'calc( 100% - ' + (this.account_col_width + this.draw_date_col_width + this.draw_result_col_width + this.actions_col_width + this.product_size_col_width + this.product_price_col_width) + 'px)';
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickClenup(){
        console.log('onClickClenup');
    }

    onClickLoad(){
        console.log('onClickLoad');
    }

    onChangeAccount(account){
        console.log(account);
    }

    render() {

        return (
            <div className="tab-pane fade" id="thedraw" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.THEDRAW}>
                <div className="container-fluid">
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-3">
                            <h4 className="contents-title">THE DRAW</h4>
                        </div>
                        <div className="col-md-3">
                            <Options label="계정" options={['abb', 'cdd']} h_on_change={this.onChangeAccount.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <Options label="상품명" options={['abb', 'cdd']} h_on_change={this.onChangeAccount.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <Options label="당첨여부" options={['abb', 'cdd']} h_on_change={this.onChangeAccount.bind(this)}/>
                        </div>                        
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>계정명</th>
                                <th scope="col" style={{width : this.product_col_width, maxWidth : this.product_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.product_size_col_width, maxWidth : this.product_size_col_width}}>사이즈</th>
                                <th scope="col" style={{width : this.product_price_col_width, maxWidth : this.product_price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.draw_date_col_width, maxWidth : this.draw_date_col_width}}>응모일시</th>
                                <th scope="col" style={{width : this.draw_result_col_width, maxWidth : this.draw_result_col_width}}>당첨결과</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* "table items" */}
                            {this.state.proxy_table_list}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickLoad.bind(this)}>
                                <img src="./res/img/cloud-arrow-down-fill.svg" style={{width:24, height:24}}/> 불러오기
                            </button>
                            <button type="button" className="btn btn-primary btn-footer-inside" onClick={this.onClickClenup.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/> 초기화
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
