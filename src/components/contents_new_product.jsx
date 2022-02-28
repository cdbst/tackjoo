
class ContentsNewProduct extends React.Component {

    proxy_edit_modal_id = 'proxy-edit-modal';
    proxy_bulk_edit_modal_id = 'proxy-bulk-edit-modal';

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.__getTableItems = this.__getTableItems.bind(this);
        this.__updateTableItems = this.__updateTableItems.bind(this);

        this.__onClickWatchBtn = this.__onClickWatchBtn.bind(this);

        this.__mount = false;

        this.state = {
            product_table_list : []
        };

        this.__ref_watch_btn = React.createRef();

        this.__setupColumnsWidth();
    }

    __setupColumnsWidth(){

        this.image_col_width = 180;
        this.price_col_width = 160;
        this.kream_price_col_width = 160;
        this.actions_col_width = 240;
        this.soldout_status_col_width = 140;
        this.name_col_width = 'calc( 100% - ' + (this.actions_col_width + this.kream_price_col_width + this.price_col_width + this.image_col_width + this.soldout_status_col_width) + 'px)';
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    __updateTableItems(){
        if(this.__mount == false) return;
        const table_items = this.__getTableItems(this.__product_info_list);
        this.setState(_ => ({
            product_table_list : table_items
        }));
    }

    __getTableItems(product_info_list){

        return product_info_list.map((product_info) =>
            <ProxyTableItem
                image_col_width={this.image_col_width}
                name_col_width={this.name_col_width}
                price_col_width={this.price_col_width}
                kream_price_col_width={this.kream_price_col_width}
                actions_col_width={this.actions_col_width}
                soldout_status_col_width={this.soldout_status_col_width}
                h_modify={this.onClickModifyProxyInfo.bind(this)}
                h_remove={this.onClickRemoveProxyInfo.bind(this)}
                product_info={product_info}
                key={product_info._id}
            />
        );
    }

    __onClickWatchBtn(status){

        //set disable button
        this.__ref_watch_btn.current.setDisabled(true);

        if(status){
            window.electron.startWatchingNewReleased((stop, product_info_list)=>{
                // TODO: set enable button
                console.log('startWatchingNewReleased -- callback : ' + stop);
                this.__ref_watch_btn.current.setDisabled(false);
                if(product_info_list === false) return;

                console.log(product_info_list);
            });

        }else{
            window.electron.stopWatchingNewReleased();
        }
    }

    render() {

        return (
            <div className="tab-pane fade" id="new-product" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.NEW_PRODUCT}>
                <div className="container-fluid">
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">{`신상품(${this.state.product_table_list.length})`}</h4>
                        </div>
                        <div className="col">
                            {/* <a>TEST : search item interface</a> */}
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.image_col_width, maxWidth : this.image_col_width}}>이미지</th>
                                <th scope="col" style={{width : this.name_col_width, maxWidth : this.name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.price_col_width, maxWidth : this.price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.kream_price_col_width, maxWidth : this.kream_price_col_width}}>크림 시세</th>
                                <th scope="col" style={{width : this.soldout_status_col_width, maxWidth : this.soldout_status_col_width}}>재고 상태</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.product_table_list}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <ToggleButton
                                ref={this.__ref_watch_btn}
                                h_on_click={this.__onClickWatchBtn.bind(this)}
                                init_state={false}
                                set_btn_label={"감시 취소"}
                                unset_btn_label={"감시 시작"}
                                set_img_src={"./res/img/tail-spin.svg"}
                                unset_img_src={"./res/img/search.svg"}
                                btn_class={"btn-primary btn-footer-inside"}
                            />
                            
                            <button type="button" className="btn btn-danger btn-footer-inside" onClick={console.log('test')}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/> 모두삭제
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}