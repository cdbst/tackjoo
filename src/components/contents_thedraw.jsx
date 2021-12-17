class ContentsTheDraw extends React.Component {

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.onClickClenup = this.onClickClenup.bind(this);
        this.onClickLoad = this.onClickLoad.bind(this);
        this.onChangeAccount = this.onChangeAccount.bind(this);

        this.state = {
           draw_table_item_list : []
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
        this.product_name_col_width = 'calc( 100% - ' + (this.account_col_width + this.draw_date_col_width + this.draw_result_col_width + this.actions_col_width + this.product_size_col_width + this.product_price_col_width) + 'px)';
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

        window.electron.loadTheDrawItemList((err, thedraw_item_list) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('Error', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            }

            if(thedraw_item_list.length == 0) return;

            console.log(thedraw_item_list);
            const draw_table_item_list = this.__getTableItems(thedraw_item_list);

            this.setState(_ => ({
                draw_table_item_list : draw_table_item_list
            }));

        });
    }

    onChangeAccount(account){
        console.log(account);
    }

    __getTableItems(draw_item_list){

        return draw_item_list.map((draw_item) =>
            <TheDrawTableItem
                account_col_width = {this.account_col_width}
                product_size_col_width = {this.product_size_col_width}
                product_price_col_width = {this.product_price_col_width}
                draw_date_col_width = {this.draw_date_col_width}
                draw_result_col_width = {this.draw_result_col_width}
                actions_col_width = {this.actions_col_width}
                product_name_col_width = {this.product_name_col_width}
                draw_item = {draw_item}
                key={draw_item._id}
            />
        );
    }

    __getDummyDrawItem(){
        return {
            account_info : {
                email : 'aaaa@gmail.com',
                pwd : '123456',
                id : common.uuidv4()
            },
            product_name : 'DUNK AA',
            prouduct_size : '230',
            prouduct_price : '180,000',
            draw_date : '2020-10-11',
            draw_result : '당첨',
            _id : common.uuidv4()
        }
    }

    render() {

        return (
            <div className="tab-pane fade" id="thedraw" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.THEDRAW}>
                <div className="container-fluid">
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-2">
                            <h4 className="contents-title">THE DRAW</h4>
                        </div>
                        <div className="col-md-2">
                            <Options label="계정" options={['abb', 'cdd']} h_on_change={this.onChangeAccount.bind(this)}/>
                        </div>
                        <div className="col-md-3">
                            <Options label="상품" options={['abb', 'cdd']} label_col_class="col-md-2" select_col_class="col-md-10"/>
                        </div>
                        <div className="col-md-3">
                            <Options label="응모일시" options={['abb', 'cdd']} />
                        </div>
                        <div className="col-md-2">
                            <Options label="당첨여부" options={['당첨', '미당첨']} label_col_class="col-md-5" select_col_class="col-md-7"/>
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>계정명</th>
                                <th scope="col" style={{width : this.product_name_col_width, maxWidth : this.product_name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.product_size_col_width, maxWidth : this.product_size_col_width}}>사이즈</th>
                                <th scope="col" style={{width : this.product_price_col_width, maxWidth : this.product_price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.draw_date_col_width, maxWidth : this.draw_date_col_width}}>응모일시</th>
                                <th scope="col" style={{width : this.draw_result_col_width, maxWidth : this.draw_result_col_width}}>당첨결과</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.draw_table_item_list}
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
