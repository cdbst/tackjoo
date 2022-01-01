class ContentsBilling extends React.Component {

    constructor(props) {
        super(props);

        this.onClickSaveBtn = this.onClickSaveBtn.bind(this);
        this.loadBillingInfo = this.loadBillingInfo.bind(this);
        this.onClickSearchBtn = this.onClickSearchBtn.bind(this);
        this.updateAddrSearchReuslt = this.updateAddrSearchReuslt.bind(this);
        this.onChangeSearchResultItem = this.onChangeSearchResultItem.bind(this);
        this.onChangeAddr1Value = this.onChangeAddr1Value.bind(this);
        this.onKeyUpAddr1 = this.onKeyUpAddr1.bind(this);
        this.update_postcode = this.update_postcode.bind(this);
        this.isBillingInfoModified = this.isBillingInfoModified.bind(this);
        this.getCurrentBillingInfo = this.getCurrentBillingInfo.bind(this);
        this.setBillingInfoToUI = this.setBillingInfoToUI.bind(this);
        this.registerOnHideTabEvent = this.registerOnHideTabEvent.bind(this);
        this.getDefaultBillingInfo = this.getDefaultBillingInfo.bind(this);

        this.ref_buyer_name = React.createRef();
        this.ref_phone_num = React.createRef();
        this.ref_addr1 = React.createRef();
        this.ref_addr2 = React.createRef();
        this.ref_postcode = React.createRef();

        this.el_sel_pay_method = 'select-pay-method';
        this.el_input_pay_id = 'input-pay-id';
        this.el_input_pay_pwd = 'input-pay-pwd';
        this.el_input_checkout_pwd = 'input-checkout-pwd';
        this.el_input_birthday = 'input-checkout-birthday';

        this.__mount = false;

        this.state = {
            opts_search_result : []
        };
    }

    componentDidMount(){
        this.__mount = true;
        this.loadBillingInfo();
        this.registerOnHideTabEvent();
    }

    getDefaultBillingInfo(){
        return {
            buyer_name: '',
            phone_num: '',
            buyer_addr1: '',
            buyer_addr2: '',
            postal_code: '',
            pay_method: 'kakaopay',
            pay_id: '',
            pay_pwd: '',
            checkout_pwd: '',
            birthday: ''
        }
    }

    registerOnHideTabEvent(){
        let tab_menu_billing = document.querySelector('#' + MenuBar.MENU_ID.BILLING);
        tab_menu_billing.addEventListener('hide.bs.tab', (event) => {
            if(this.isBillingInfoModified() == false) return;
            
            event.preventDefault();

            Index.g_prompt_modal.popModal('경고', <p>이동시 변경 내용이 모두 사라집니다. 이동하시겠습니까?</p>, (is_ok)=>{

                if(is_ok == false) return;

                this.setBillingInfoToUI(Index.g_billing_info);
                let tab_menu_to_show = document.querySelector('#' + event.relatedTarget.id);
                let el_bs_tab_menu_to_show = bootstrap.Tab.getOrCreateInstance(tab_menu_to_show);
                el_bs_tab_menu_to_show.show();
            });
        });
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    isBillingInfoModified(){
        return !window.electron.compareJSON(Index.g_billing_info, this.getCurrentBillingInfo());
    }

    getCurrentBillingInfo(){

        const cur_pay_method = document.getElementById(this.el_sel_pay_method).value;
        const cur_pay_id = document.getElementById(this.el_input_pay_id).value;
        const cur_pay_pwd = document.getElementById(this.el_input_pay_pwd).value;
        const cur_checkout_pwd = document.getElementById(this.el_input_checkout_pwd).value;
        const cur_birthday = document.getElementById(this.el_input_birthday).value;

        return billing_info = {
            buyer_name : this.ref_buyer_name.current.value,
            phone_num : this.ref_phone_num.current.value,
            buyer_addr1 : this.ref_addr1.current.value,
            buyer_addr2 : this.ref_addr2.current.value,
            postal_code : this.ref_postcode.current.value === undefined ? '' : this.ref_postcode.current.value,
            pay_method : cur_pay_method === undefined ? '' : cur_pay_method,
            pay_id : cur_pay_id === undefined ? '' : cur_pay_id,
            pay_pwd : cur_pay_pwd === undefined ? '' : cur_pay_pwd,
            checkout_pwd : cur_checkout_pwd === undefined ? '' : cur_checkout_pwd,
            birthday : cur_birthday === undefined ? '' : cur_birthday,
        };
    }

    setBillingInfoToUI(billing_info){

        if(billing_info == undefined) return;

        this.ref_buyer_name.current.value = billing_info.buyer_name;
        this.ref_phone_num.current.value = billing_info.phone_num;
        this.ref_addr1.current.value = billing_info.buyer_addr1;
        this.ref_addr2.current.value = billing_info.buyer_addr2;
        this.update_postcode(billing_info.postal_code);
        document.getElementById(this.el_sel_pay_method).value = billing_info.pay_method;
        document.getElementById(this.el_input_pay_id).value = billing_info.pay_id;
        document.getElementById(this.el_input_pay_pwd).value = billing_info.pay_pwd;
        document.getElementById(this.el_input_checkout_pwd).value = billing_info.checkout_pwd;
        document.getElementById(this.el_input_birthday).value = billing_info.birthday;
    }

    onClickSaveBtn(){

        let billing_info = this.getCurrentBillingInfo();

        if(billing_info.buyer_name == undefined || billing_info.buyer_name == ''){
            Index.g_sys_msg_q.enqueue('에러', '받으시는 분 이름이 지정되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(billing_info.phone_num == undefined || billing_info.phone_num == ''){
            Index.g_sys_msg_q.enqueue('에러', '받으시는 분 전화번호가 지정되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(billing_info.buyer_addr1 == undefined || billing_info.buyer_addr1 == ''){
            Index.g_sys_msg_q.enqueue('에러', '받으시는 분 주소가 지정되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        
        if(billing_info.buyer_addr2 == undefined || billing_info.buyer_addr2 == ''){
            Index.g_sys_msg_q.enqueue('에러', '받으시는 분 세부 주소가 지정되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(billing_info.postal_code == undefined || billing_info.postal_code == ''){
            Index.g_sys_msg_q.enqueue('에러', '주소 지정시 검색 버튼을 통해 우편번호를 검색하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        //TODO: 결제 방법이 payco일경우, 결제 정보를 설정하지 않았을 경우, 오류를 출력해야함.
        // pay_method
        // pay_id 
        // pay_pwd
        // checkout_pwd
        // birthday

        window.electron.saveBillingInfo(billing_info, (err) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', '결제정보 저장에 실패했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            Index.g_billing_info = billing_info;
            Index.g_sys_msg_q.enqueue('안내', '결제정보 저장에 성공했습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    loadBillingInfo(){

        window.electron.loadBillingInfo((err, billing_info) =>{
            
            if(this.__mount == false) return;

            if(err){
                Index.g_sys_msg_q.enqueue('경고', '결제 정보가 아직 없거나 읽을수 없습니다.', ToastMessageQueue.TOAST_MSG_TYPE.WARN, 5000);
                Index.g_billing_info = this.getDefaultBillingInfo();
                return;
            }

            Index.g_billing_info = common.merge_object(this.getDefaultBillingInfo(), billing_info);
            this.setBillingInfoToUI(Index.g_billing_info);
            Index.g_sys_msg_q.enqueue('안내', '결제 정보를 성공적으로 읽었습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    onChangeAddr1Value(e){
        this.update_postcode('');
    }

    onKeyUpAddr1(e){

        e.preventDefault();

        if(e.key === 'Enter'){
            this.onClickSearchBtn();
        }
    }

    onClickSearchBtn(){
        let buyer_addr1 = this.ref_addr1.current.value;

        if(buyer_addr1 == undefined || buyer_addr1 == ''){
            Index.g_sys_msg_q.enqueue('에러', '검색할 주소를 입력하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        window.electron.searchAddr(buyer_addr1, (err, search_result) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            this.updateAddrSearchReuslt(search_result);
        });
    }

    updateAddrSearchReuslt(search_result){

        let get_addr_item_value = (addr_item, add_postcode = true) =>{
            let addr_item_val =  addr_item.ko_common + ' ' + addr_item.ko_doro; 
            if(add_postcode) addr_item_val += ' (' + addr_item.postcode5 + ')';
            return addr_item_val;
        }

        let _opts_search_result = search_result.map((addr_item) => 
            <option key={common.uuidv4()} data-postcode={addr_item.postcode5} value={get_addr_item_value(addr_item, false)}>{get_addr_item_value(addr_item)}</option>
        );

        if(this.__mount == false) return;

        this.setState(_ => ({
            opts_search_result : _opts_search_result
        }));
    }

    onChangeSearchResultItem(e){

        let selected_idx = e.target.selectedIndex;
        let selected_opt = e.target[selected_idx];

        let selected_addr_value = selected_opt.value;
        let selected_addr_postcode = undefined;

        for(var i = 0; i < selected_opt.attributes.length; i++){
            if(selected_opt.attributes[i]['localName'] == 'data-postcode'){
                selected_addr_postcode = selected_opt.attributes[i]['nodeValue'];
            }
            if(selected_opt.attributes[i]['localName'] == 'value'){
                selected_addr_value = selected_opt.attributes[i]['nodeValue'];
            }
        }

        this.ref_addr1.current.value = selected_addr_value;
        this.update_postcode(selected_addr_postcode);
    }

    update_postcode(value){
        this.ref_postcode.current.value = value;
        this.ref_postcode.current.innerText  = '(' + value + ')';
    }

    render() {

        return (
            <div className="tab-pane fade" id="billing" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.BILLING}>
                <div className="container-fluid">
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">결제정보</h4>
                        </div>
                    </div>
                    <br/>
                    <div className="row">
                        <div className="md-6 col">
                            <div className="md-12 row">
                                <div className="col-md-6">
                                    <label htmlFor="input-buyer-name" className="form-label contents-bill-input-label">받으시는 분</label>
                                    <input type="text" className="form-control" placeholder="이름" id="input-buyer-name" ref={this.ref_buyer_name} style={{'--width' : '450px'}}/>
                                </div>
                            </div>
                            <br/>
                            <div className="m2-12 row">
                                <div className="col-md-6">
                                    <label htmlFor="input-buyer-phone-num" className="form-label contents-bill-input-label">연락처</label>
                                    <input type="number" className="form-control" placeholder="-없이 입력" id="input-buyer-phone-num" ref={this.ref_phone_num} onWheel={(e) => e.target.blur()} style={{'--width' : '450px'}}/>
                                </div>
                            </div>
                            <br/>
                            <div className="md-12 row" style={{marginBottom : 5}}>
                                <div className="col-mb-6">
                                    <label htmlFor="input-buyer-addr" className="form-label contents-bill-input-label">배송 주소</label>
                                    <label className="form-label contents-bill-input-label" ref={this.ref_postcode} ></label>
                                    <div className="input-group col-mb-3">
                                        <input id="input-buyer-addr" type="text" className="form-control contents-bill-input-addr" placeholder="주소" aria-label="주소" aria-describedby="addr-serach-btn" ref={this.ref_addr1} onChange={this.onChangeAddr1Value.bind(this)} onKeyUp={this.onKeyUpAddr1.bind(this)} style={{'--width' : '450px'}}/>
                                        <button className="btn btn-primary" type="button" id="addr-serach-btn" onClick={this.onClickSearchBtn.bind(this)}>검색</button>
                                    </div>
                                </div>
                            </div>
                            <div className="md-12 row">
                                <div className="col-mb-6">
                                    <input id="input-buyer-addr-detail" type="text" className="form-control" placeholder="나머지 주소" aria-label="나머지 주소" ref={this.ref_addr2} style={{'--width' : '450px'}}/>
                                </div>
                            </div>
                            <br />
                            <div className="m2-12 row">
                                <div className="col-md-6">
                                    <label className="form-label contents-bill-input-label">결제 수단</label>
                                    <select id={this.el_sel_pay_method} className="form-select form-select-down-arrw modal-select" aria-label="Default select example" >
                                        <option className="select-option" value="kakaopay">카카오페이</option>
                                        <option className="select-option" value="payco">페이코</option>
                                    </select>
                                </div>
                            </div>
                            <br />
                            <div className="m2-12 row">
                                <div className="col-md-6">
                                    <label className="form-label contents-bill-input-label">결제 계정</label>
                                    <div className="form-floating">
                                        <input type="text" className="form-control" id={this.el_input_pay_id} style={{"--width" : "100%"}} placeholder="아이디 또는 이메일" />
                                        <label className="common-input-label" htmlFor={this.el_input_pay_id}>아이디 또는 이메일</label>
                                    </div>
                                    <div className="form-floating">
                                        <input type="password" className="form-control" id={this.el_input_pay_pwd} style={{"--width" : "100%"}} placeholder="비밀번호" />
                                        <label className="common-input-label" htmlFor={this.el_input_pay_pwd}>비밀번호</label>
                                    </div>
                                    <div className="form-floating">
                                        <input type="password" className="form-control" id={this.el_input_checkout_pwd} style={{"--width" : "100%"}} placeholder="결제 비밀번호(6자리숫자)" />
                                        <label className="common-input-label" htmlFor={this.el_input_checkout_pwd}>결제 비밀번호(6자리숫자)</label>
                                    </div>
                                    <div className="form-floating">
                                        <input type="text" className="form-control" id={this.el_input_birthday} style={{"--width" : "100%"}} placeholder="생년월일 예시)19950130" />
                                        <label className="common-input-label" htmlFor={this.el_input_birthday}>생년월일 예시)19950130</label>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div className="md-6 col">
                            <div className="m2-12 row">
                                <div className="col-md-6">
                                    <label htmlFor="opts-addr-search-result" className="form-label contents-bill-input-label">주소 검색 결과</label>
                                    <select className="form-select form-select-down-arrw select-addr-search-result" size="16" aria-label="size 16 select example" id="opts-addr-search-result" onChange={this.onChangeSearchResultItem.bind(this)}>
                                        {this.state.opts_search_result}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center" onClick={this.onClickSaveBtn.bind(this)}>
                            <button type="button" className="btn btn-primary btn-footer-inside">
                                <img src="./res/img/save2-fill.svg" style={{width:24, height:24}}/> 저장하기
                            </button>
                        </div>
                    </div>
                    <br/>
                </div>
            </div>
        );
    }
}