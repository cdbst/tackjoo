class ContentsBill extends React.Component {

    constructor(props) {
        super(props);

        this.onClickSaveBtn = this.onClickSaveBtn.bind(this);
        this.loadBillInfo = this.loadBillInfo.bind(this);
        this.onClickSearchBtn = this.onClickSearchBtn.bind(this);

        this.ref_buyer_name = React.createRef();
        this.ref_phone_num = React.createRef();
        this.ref_addr1 = React.createRef();
        this.ref_addr2 = React.createRef();

        this.__mount = false;

        this.state = {
            postal_num : undefined
        };
    }

    componentDidMount(){
        this.__mount = true;
        this.loadBillInfo();
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickSaveBtn(){
        let buyer_name = this.ref_buyer_name.current.value;
        let phone_num = this.ref_phone_num.current.value;
        let buyer_addr1 = this.ref_addr1.current.value;
        let buyer_addr2 = this.ref_addr2.current.value;
        let postal_num = this.state.postal_num;


        if(buyer_name == undefined || buyer_name == ''){
            Index.g_sys_msg_q.enqueue('Error', '받으실 분 이름이 지정되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(phone_num == undefined || phone_num == ''){
            Index.g_sys_msg_q.enqueue('Error', '받으실 분 전화번호가 지정되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(buyer_addr1 == undefined || buyer_addr1 == ''){
            Index.g_sys_msg_q.enqueue('Error', '받으실 분 주소가 지정되지 않았습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        if(postal_num == undefined || postal_num == ''){
            Index.g_sys_msg_q.enqueue('Error', '주소 지정시 검색 버튼을 통해 우편번호를 검색하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }
    }

    loadBillInfo(){

    }

    onClickSearchBtn(){
        let buyer_addr1 = this.ref_addr1.current.value;

        if(buyer_addr1 == undefined || buyer_addr1 == ''){
            Index.g_sys_msg_q.enqueue('Error', '검색할 주소를 입력하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        window.electron.searchAddr(buyer_addr1, (err, search_result) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('Error', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            //TEST CODE
            Index.g_sys_msg_q.enqueue('INFO', search_result, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    render() {

        let display_postal_num = this.state.postal_num == undefined ? '' : this.state.postal_num

        return (
            <div className="container-fluid">
                <br/>
                <div className="row">
                    <div className="col">
                        <h4 className="contents-title">Bill Informations</h4>
                    </div>
                </div>
                <br/>
                <div className="row">
                    <div className="md-6 col">
                        <div className="md-12 row">
                            <div className="col-md-6">
                                <label htmlFor="input-buyer-name" className="form-label contents-bill-input-label">받으시는 분</label>
                                <input type="text" className="form-control" placeholder="이름" id="input-buyer-name" ref={this.ref_buyer_name}/>
                            </div>
                        </div>
                        <br/>
                        <div className="m2-12 row">
                            <div className="col-md-6">
                                <label htmlFor="input-buyer-phone-num" className="form-label contents-bill-input-label">연락처</label>
                                <input type="number" className="form-control" placeholder="-없이 입력" id="input-buyer-phone-num" ref={this.ref_phone_num}/>
                            </div>
                        </div>
                        <br/>
                        <div className="md-12 row" style={{marginBottom : 5}}>
                            <div className="col-mb-6">
                                <label htmlFor="input-buyer-addr" className="form-label contents-bill-input-label">{"배송 주소(" + display_postal_num + ")"}</label>
                                <div className="input-group col-mb-3">
                                    <input id="input-buyer-addr" type="text" className="form-control contents-bill-input-addr" placeholder="주소" aria-label="주소" aria-describedby="addr-serach-btn" ref={this.ref_addr1}/>
                                    <button className="btn btn-primary" type="button" id="addr-serach-btn" onClick={this.onClickSearchBtn.bind(this)}>검색</button>
                                </div>
                            </div>
                        </div>
                        <div className="md-12 row">
                            <div className="col-mb-6">
                                <input id="input-buyer-addr-detail" type="text" className="form-control" placeholder="나머지 주소" aria-label="나머지 주소" ref={this.ref_addr2}/>
                            </div>
                        </div>
                        <br />
                        <div className="m2-12 row">
                            <div className="col-md-6">
                                <label htmlFor="input-buyer-phone-num" className="form-label contents-bill-input-label">결제 방식</label>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="opt-checkout-method-kakaopay" defaultChecked/>
                                    <label className="form-check-label" htmlFor="opt-checkout-method-kakaopay">카카오페이</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="opt-checkout-method-naverpay" disabled/>
                                    <label className="form-check-label" htmlFor="opt-checkout-method-naverpay">네이버페이</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md-6 col">
                        <div className="m2-12 row">
                            <div className="col-md-6">
                                <label htmlFor="opts-addr-search-result" className="form-label contents-bill-input-label">주소 검색 결과</label>
                                <select className="form-select select-addr-search-result" size="16" aria-label="size 16 select example" id="opts-addr-search-result">
                                    <option value="0">Open this select menu</option>
                                    <option value="1">One</option>
                                    <option value="2">Two</option>
                                    <option value="3">Three</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row footer">
                    <div className="d-flex flex-row-reverse bd-highlight align-items-center" onClick={this.onClickSaveBtn.bind(this)}>
                        <button type="button" className="btn btn-warning btn-footer-inside">
                            <img src="./res/img/save2-fill.svg" style={{width:24, height:24}}/> Save
                        </button>
                    </div>
                </div>
                <br/>
                
            </div>
        );
    }
}