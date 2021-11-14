class ContentsBill extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container-fluid">
                <br/>
                <div className="row">
                    <div className="col">
                        <h4 className="contents-title">Bill Informations</h4>
                    </div>
                </div>
                <br/>
                <div className="md-12 row">
                    <div className="col-md-6">
                        <label htmlFor="input-buyer-name" className="form-label contents-bill-input-label">받으시는 분</label>
                        <input type="text" className="form-control" placeholder="이름" id="input-buyer-name"/>
                    </div>
                </div>
                <br/>
                <div className="m2-12 row">
                    <div className="col-md-6">
                        <label htmlFor="input-buyer-phone-num" className="form-label contents-bill-input-label">연락처</label>
                        <input type="number" className="form-control" placeholder="-없이 입력" id="input-buyer-phone-num"/>
                    </div>
                </div>
                <br/>
                <div className="md-12 row" style={{marginBottom : 5}}>
                    <div className="col-mb-6">
                        <label htmlFor="input-buyer-addr" className="form-label contents-bill-input-label">{"배송 주소()"}</label>
                        <div className="input-group col-mb-3">
                            <input id="input-buyer-addr" type="text" className="form-control contents-bill-input-addr" placeholder="주소" aria-label="주소" aria-describedby="addr-serach-btn"/>
                            <button className="btn btn-primary" type="button" id="addr-serach-btn">검색</button>
                        </div>
                    </div>
                </div>
                <div className="md-12 row">
                    <div className="col-mb-6">
                        <input id="input-buyer-addr-detail" type="text" className="form-control" placeholder="나머지 주소" aria-label="나머지 주소"/>
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
                <div className="row footer">
                    <div className="d-flex flex-row-reverse bd-highlight align-items-center">
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