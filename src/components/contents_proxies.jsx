
class ContentsProxies extends React.Component {

    proxy_edit_modal_id = 'proxy-edit-modal';
    proxy_bulk_edit_modal_id = 'proxy-bulk-edit-modal';

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);
        this.__getTableItems = this.__getTableItems.bind(this);
        this.onClickAddProxy = this.onClickAddProxy.bind(this);
        this.onClickAddBulkProxy = this.onClickAddBulkProxy.bind(this);
        this.onCreateProxyInfo = this.onCreateProxyInfo.bind(this);
        this.onCreateProxyInfoList = this.onCreateProxyInfoList.bind(this);
        this.onModifyProxyInfo = this.onModifyProxyInfo.bind(this);

        this.onClickRemoveProxyInfo = this.onClickRemoveProxyInfo.bind(this);
        this.onClickModifyProxyInfo = this.onClickModifyProxyInfo.bind(this);

        this.__addProxyInfo = this.__addProxyInfo.bind(this);
        this.__removeProxyInfo = this.__removeProxyInfo.bind(this);
        this.__modifyProxyInfo = this.__modifyProxyInfo.bind(this);
        this.__getProxyInfo = this.__getProxyInfo.bind(this);

        this.__openProxyEditModal = this.__openProxyEditModal.bind(this);
        this.__openProxyBulkEditModal = this.__openProxyBulkEditModal.bind(this);
        this.__checkProxyInfoValues = this.__checkProxyInfoValues.bind(this);
        this.__updateTableItems = this.__updateTableItems.bind(this);

        this.__saveProxyInfo = this.__saveProxyInfo.bind(this);

        this.__mount = false;
        this.__proxy_info_list = [];

        this.__ref_proxy_edit_modal = React.createRef();

        this.state = {
            proxy_table_list : []
        };

        this.__setupColumnsWidth();
    }

    __setupColumnsWidth(){
        this.actions_col_width = 240;
        this.port_col_width = 120;
        this.ip_col_width = 240; //'calc( 100% - ' + (this.actions_col_width + this.port_col_width) + 'px)';
        this.alias_col_width = 240;
        this.username_col_width = 'calc( 100% - ' + (this.actions_col_width + this.port_col_width + this.ip_col_width + this.alias_col_width) + 'px)';
    }

    __addProxyInfo(ip, port, id, pwd, alias){
        this.__proxy_info_list.push({
            ip : ip,
            port : port,
            id : id,
            pwd : pwd,
            alias : alias,
            _id : common.uuidv4()
        });
    }

    __modifyProxyInfo(_id, ip, port, id, pwd, alias){
        for(var i = 0; i < this.__proxy_info_list.length; i++){
            if(this.__proxy_info_list[i]._id == _id){
                this.__proxy_info_list[i].ip = ip;
                this.__proxy_info_list[i].port = port;
                this.__proxy_info_list[i].id = id;
                this.__proxy_info_list[i].pwd = pwd;
                this.__proxy_info_list[i].alias = alias;
                break;
            }
        }
    }

    __removeProxyInfo(_id){
        this.__proxy_info_list = this.__proxy_info_list.filter((proxy_info)=>{
            return proxy_info._id != _id;
        });
    }

    __getProxyInfo(_id){
        return this.__proxy_info_list.find((proxy_info)=>{
            return proxy_info._id == _id;
        });
    }

    componentDidMount(){
        this.__mount = true;

        window.electron.loadProxyInfo((err, proxy_info_list)=>{
            if(err){
                Index.g_sys_msg_q.enqueue('경고', '프록시 정보가 아직 없거나 읽을 수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 3000);
                return;
            }

            this.__proxy_info_list = proxy_info_list;
            this.__updateTableItems();
        });
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    __updateTableItems(){
        if(this.__mount == false) return;
        const table_items = this.__getTableItems(this.__proxy_info_list);
        this.setState(_ => ({
            proxy_table_list : table_items
        }));
    }

    __getTableItems(proxy_info_list){

        return proxy_info_list.map((proxy_info) =>
            <ProxyTableItem
                ip_col_width={this.ip_col_width}
                port_col_width={this.port_col_width}
                username_col_width={this.username_col_width}
                alias_col_width={this.alias_col_width}
                actions_col_width={this.actions_col_width}
                h_modify={this.onClickModifyProxyInfo.bind(this)}
                h_remove={this.onClickRemoveProxyInfo.bind(this)}
                proxy_info={proxy_info}
                key={proxy_info._id}
            />
        );
    }

    onClickModifyProxyInfo(_id){
        const proxy_info_to_modify = this.__getProxyInfo(_id);
        this.__openProxyEditModal(proxy_info_to_modify);
    }

    onClickRemoveProxyInfo(_id){
        this.__removeProxyInfo(_id);
        this.__updateTableItems();

        this.__saveProxyInfo();
    }

    __checkProxyInfoValues(ip, port, alias){
        if(ip == undefined || ip == ''){
            Index.g_sys_msg_q.enqueue('에러', 'IP 주소값이 입력되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return false;
        }

        if(port == undefined || port == ''){
            Index.g_sys_msg_q.enqueue('에러', '포트값이 입력되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return false;
        }

        if(alias == undefined || alias == ''){
            Index.g_sys_msg_q.enqueue('에러', '프록시 이름이 입력되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return false;
        }

        return true;
    }

    __saveProxyInfo(){
        window.electron.saveProxyInfo(this.__proxy_info_list, (err)=>{
            if(err){
                Index.g_sys_msg_q.enqueue('에러', '프록시 정보 저장에 실패했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            }
        });
    }

    onModifyProxyInfo(ip, port, id, pwd, alias, _id){
        if(this.__checkProxyInfoValues(ip, port, alias) == false) return;
        this.__modifyProxyInfo(_id, ip, port, id, pwd, alias);
        this.__updateTableItems();

        this.__saveProxyInfo();
    }

    onCreateProxyInfo(ip, port, id, pwd, alias){
        if(this.__checkProxyInfoValues(ip, port, alias) == false) return;
        this.__addProxyInfo(ip, port, id, pwd, alias);
        this.__updateTableItems();

        this.__saveProxyInfo();
    }

    onCreateProxyInfoList(proxy_info_list){
        console.log(proxy_info_list);
    }

    __openProxyEditModal(proxy_info){
        let el_modal = document.getElementById(this.proxy_edit_modal_id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);

        if(proxy_info != undefined){
            this.__ref_proxy_edit_modal.current.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.IP, proxy_info.ip);
            this.__ref_proxy_edit_modal.current.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.PORT, proxy_info.port);
            this.__ref_proxy_edit_modal.current.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.ID, proxy_info.id);
            this.__ref_proxy_edit_modal.current.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.PWD, proxy_info.pwd);
            this.__ref_proxy_edit_modal.current.inputValue(ProxyEditModal.EL_ID_MODAL_INPUT.ALIAS, proxy_info.alias);
            this.__ref_proxy_edit_modal.current.proxy_info_id = proxy_info._id;
        }else{
            this.__ref_proxy_edit_modal.current.proxy_info_id = undefined;
        }

        bs_obj_modal.show();
    }

    __openProxyBulkEditModal(){
        let el_modal = document.getElementById(this.proxy_bulk_edit_modal_id);
        var bs_obj_modal = bootstrap.Modal.getOrCreateInstance(el_modal);
        bs_obj_modal.show();
    }

    onClickAddProxy(){
        this.__openProxyEditModal();
    }

    onClickAddBulkProxy(){
        this.__openProxyBulkEditModal();
    }

    render() {

        return (
            <div className="tab-pane fade" id="proxies" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.PROXIES}>
                <div className="container-fluid">
                    <ProxyEditModal 
                        ref={this.__ref_proxy_edit_modal} 
                        id={this.proxy_edit_modal_id} 
                        h_create_proxy={this.onCreateProxyInfo.bind(this)}
                        h_modify_proxy={this.onModifyProxyInfo.bind(this)}
                    />
                    <TextareaEditModal 
                        id={this.proxy_bulk_edit_modal_id} 
                        h_submit={this.onCreateProxyInfoList.bind(this)}
                        title="프록시 여러개 추가하기"
                        desc="한 줄당 프록시 하나 👉 999.777.888.123:8080 또는 999.777.888.123:8080:아이디:비번"
                    />
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">프록시</h4>
                        </div>
                        <div className="col">
                            {/* <a>TEST : search item interface</a> */}
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.ip_col_width, maxWidth : this.ip_col_width}}>IP주소</th>
                                <th scope="col" style={{width : this.port_col_width, maxWidth : this.port_col_width}}>포트</th>
                                <th scope="col" style={{width : this.username_col_width, maxWidth : this.username_col_width}}>ID</th>
                                <th scope="col" style={{width : this.alias_col_width, maxWidth : this.alias_col_width}}>이름</th>                                
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>동작</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.proxy_table_list}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <button type="button" className="btn btn-primary btn-footer-inside" onClick={this.onClickAddProxy.bind(this)}>
                                <img src="./res/img/file-plus-fill.svg" style={{width:24, height:24}}/> 추가하기
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={this.onClickAddBulkProxy.bind(this)}>
                                <img src="./res/img/lightning-fill.svg" style={{width:24, height:24}}/> 여러개 추가
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}