class ContentsExclusive extends React.Component {

    EXCLUSIVE_LINK_LOADER_MODAL_ID = 'exclusive-link-loader-modal';

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.onClickClenup = this.onClickClenup.bind(this);
        this.setContents = this.setContents.bind(this);
        this.clearContents = this.clearContents.bind(this);
        this.onCreateTask = this.onCreateTask.bind(this);
        this.onSubmitExclusiveLink = this.onSubmitExclusiveLink.bind(this);

        this.exclusive_item_list = [];

        this.state = {
           exclusive_table_item_list : [],
        };
        
        this.__ref_load_btn = React.createRef();

        this.__mount = false;
        this.__setupColumnsWidth();

    }

    __setupColumnsWidth(){

        this.image_col_width = 70;
        this.account_col_width = 240;
        this.product_size_col_width = 120;
        this.product_price_col_width = 180;
        this.product_model_id_col_width = 130;
        this.actions_col_width = 240;
        this.product_name_col_width = 'calc( 100% - ' + (this.image_col_width + this.account_col_width + this.actions_col_width + this.product_size_col_width + this.product_price_col_width + this.product_model_id_col_width) + 'px)';
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickClenup(){
        this.clearContents();
    }

    onSubmitExclusiveLink(exclusive_url){

        Index.g_sys_msg_q.enqueue('안내', '서버로부터 EXCLUSIVE ACCESS 당첨 결과를 읽어옵니다. 계정 하나당 5~7초정도 소요됩니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

        window.electron.loadExclusiveInfo(exclusive_url, (err, exclusive_item_list) =>{

            if(err) Index.g_sys_msg_q.enqueue('안내', err, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
            if(exclusive_item_list.length === 0) return;
            Index.g_sys_msg_q.enqueue('안내', 'EXCLUSIVE ACCESS 당첨 결과를 읽어왔습니다. 구매 가능 계정만 테이블에 추가됩니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);

            this.exclusive_item_list = exclusive_item_list;

            this.clearContents(()=>{
                this.setContents(this.exclusive_item_list);
            });
        });

    }

    setContents(exclusive_item_list){
        
        let exclusive_table_item_list = this.__getTableItems(exclusive_item_list);

        this.setState(_ => ({
            exclusive_table_item_list : exclusive_table_item_list,
        }));
    }

    clearContents(__callback){
        
        this.setState({
            exclusive_table_item_list : []
        }, () => {
            if(__callback)__callback();
        });
    }

    __getTableItems(exclusive_item_list){

        return exclusive_item_list.map((exclusive_item) =>
            <ExclusiveTableItem
                account_col_width = {this.account_col_width}
                product_size_col_width = {this.product_size_col_width}
                product_price_col_width = {this.product_price_col_width}
                product_model_id_col_width = {this.product_model_id_col_width}
                actions_col_width = {this.actions_col_width}
                product_name_col_width = {this.product_name_col_width}
                image_col_width = {this.image_col_width}
                h_on_create_task={this.onCreateTask.bind(this)}
                account_email = {exclusive_item.email}
                product_info = {exclusive_item.product_info}
                key={exclusive_item._id}
            />
        );
    }

    onCreateTask(product_info, account_email){
        this.props.contents_task_ref.current.create_manual_task(product_info, account_email);
    }

    render() {

        return (
            <div className="tab-pane fade" id="exclusive" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.EXCLUSIVE}>
                <div className="container-fluid">
                    <LoadLinkProductModal 
                        id={this.EXCLUSIVE_LINK_LOADER_MODAL_ID} 
                        h_on_submit={this.onSubmitExclusiveLink.bind(this)}
                        allow_patterns={['https://go.nike.com/']}
                        title={"익스클루시브 링크 (https://go.nike.com/??)"}
                    />
                    <br/>
                    <div className="row" style={{marginBottom:'15px'}}>
                        <div className="col-md-2">
                            <h4 className="contents-title">익스클루시브</h4>
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.image_col_width, maxWidth : this.image_col_width}}>이미지</th>
                                <th scope="col" style={{width : this.account_col_width, maxWidth : this.account_col_width}}>계정명</th>
                                <th scope="col" style={{width : this.product_name_col_width, maxWidth : this.product_name_col_width}}>상품명</th>
                                <th scope="col" style={{width : this.product_model_id_col_width, maxWidth : this.product_model_id_col_width}}>모델(스타일)</th>
                                <th scope="col" style={{width : this.product_size_col_width, maxWidth : this.product_size_col_width}}>사이즈</th>
                                <th scope="col" style={{width : this.product_price_col_width, maxWidth : this.product_price_col_width}}>가격</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.exclusive_table_item_list}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <button type="button" className="btn btn-info btn-footer-inside" data-bs-toggle="modal" data-bs-target={'#' + this.EXCLUSIVE_LINK_LOADER_MODAL_ID}>
                                <img src="./res/img/cloud-arrow-down-fill.svg" style={{width:24, height:24}}/> 당첨 확인
                            </button>
                            <button type="button" className="btn btn-danger btn-footer-inside" onClick={this.onClickClenup.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/> 초기화
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
