'use strict';

class MenuBar extends React.Component {

    static MENU_ID = {
        BILLING : "billing-tab",
        TASKS : "tasks-tab",
        ACCOUNTS : "accounts-tab",
        PROXIES : "proxies-tab",
        SETTINGS : "settings-tab",
        THEDRAW : "thedraw-tab",
        NEW_PRODUCT : 'new-product-tab',
        ORDER_LIST : 'order-list-tab'
    }

    constructor(props) {
        super(props);

        this.serverTimeAlamListener = this.serverTimeAlamListener.bind(this);

        this.state = {
            server_time : common.get_formatted_date_str(new Date(), true)
        }

        this.__mount = false;
        Index.g_server_clock.subscribeAlam(undefined, this.serverTimeAlamListener, common.uuidv4());
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    serverTimeAlamListener(date){
        if(this.__mount == false) return;
        this.setState(_ => ({
            server_time : common.get_formatted_date_str(date, true)
        }));
    }

    render() {
        return (
            <div>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    
                    <li className="nav-item" role="presentation">
                        <a className="nav-link active" id={MenuBar.MENU_ID.TASKS} data-bs-toggle="tab" href="#tasks" role="tab" aria-controls="tasks" aria-selected="true">작업</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.THEDRAW} data-bs-toggle="tab" href="#thedraw" role="tab" aria-controls="thedraw" aria-selected="false">응모</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.NEW_PRODUCT} data-bs-toggle="tab" href="#new-product" role="tab" aria-controls="new-product" aria-selected="false">신상품</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.ACCOUNTS} data-bs-toggle="tab" href="#accounts" role="tab" aria-controls="accounts" aria-selected="false">계정관리</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.BILLING} data-bs-toggle="tab" href="#billing" role="tab" aria-controls="billing" aria-selected="false">결제관리</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.ORDER_LIST} data-bs-toggle="tab" href="#order-list" role="tab" aria-controls="order-list" aria-selected="false">주문내역</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.PROXIES} data-bs-toggle="tab" href="#proxies" role="tab" aria-controls="proxies" aria-selected="false">프록시</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.SETTINGS} data-bs-toggle="tab" href="#settings" role="tab" aria-controls="settings" aria-selected="false">설정</a>
                    </li>
                    <ul className="nav justify-content-end" style={{width:'calc(100% - 700px)'}}>
                        <li className="nav-item">
                            <a className="nav-link">{this.state.server_time}</a>
                        </li>
                    </ul>
                </ul>
            </div>
        );
    }
}