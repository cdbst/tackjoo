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
        this.runNewVersionWatchdog = this.runNewVersionWatchdog.bind(this);
        this.onClickUpdateChecker = this.onClickUpdateChecker.bind(this);

        this.state = {
            server_time : common.get_formatted_date_str(new Date(), true),
            show_update_notify : false
        }

        this.__mount = false;
        Index.g_server_clock.subscribeAlam(undefined, this.serverTimeAlamListener, common.uuidv4());
        this.ref_menubar_ctrls = React.createRef();
    }

    componentDidMount(){
        this.__mount = true;
        this.runNewVersionWatchdog();
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

    runNewVersionWatchdog(){

        const WATCHDOG_INTERVAL = 1000 * 60 * 1; // 1 min;
        const cur_app_version = window.electron.getAppVersion();

        const update_checker = setInterval(()=>{

            CommonUtils.checkUpdate(cur_app_version, (err, result) =>{
                if(err) return;
                if(result !== true) return;
                this.setState({ show_update_notify : true });
                clearInterval(update_checker);
            });

        }, WATCHDOG_INTERVAL);
    }

    onClickUpdateChecker(){
        Index.g_prompt_modal.popModal('경고', <p>새로운 버전이 확인되었습니다. 확인 버튼을 누르면 재시작과 동시에 프로그램이 업데이트 됩니다.</p>, (is_ok)=>{
            if(is_ok) window.electron.restartToUpdate();
        });
    }

    onClickTimeRefreeshBtn(){
        Index.g_server_clock.refreeshClock();
        Index.g_sys_msg_q.enqueue('알림', `서버 시간을 갱신했습니다.`, ToastMessageQueue.TOAST_MSG_TYPE.INFO, 1000);
    }

    render() {
        return (
            <div className="title-bar">
                <ul className="nav nav-tabs" id="menu-tabs" role="tablist">
                    <li className="nav-item" style={{paddingLeft: 12}}>
                        <img className="nav-bar-icon" src="./res/img/icon.ico" style={{cursor:'default'}}/>
                    </li>
                    <li className="nav-item" role="presentation" style={{paddingLeft: 4}}>
                        <a className="nav-link active" id={MenuBar.MENU_ID.TASKS} data-bs-toggle="tab" href="#tasks" role="tab" aria-controls="tasks" aria-selected="true">작업</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.NEW_PRODUCT} data-bs-toggle="tab" href="#new-product" role="tab" aria-controls="new-product" aria-selected="false">신상품</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.THEDRAW} data-bs-toggle="tab" href="#thedraw" role="tab" aria-controls="thedraw" aria-selected="false">응모</a>
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
                    <ul className="nav justify-content-end app-drag-area" style={{width:'calc(100% - 810px)'}} onDoubleClick={()=>{this.ref_menubar_ctrls.current.toggleMaximizedStatus(false);}}>
                        <li className="nav-item">
                            <img className="nav-bar-icon" src="./res/img/arrow-clockwise.svg" onClick={this.onClickTimeRefreeshBtn} title="서버시간 갱신하기"/>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link">{this.state.server_time}</a>
                        </li>
                        <li className="nav-item" style={{display : this.state.show_update_notify ? 'block' : 'none'}} onClick={this.onClickUpdateChecker}>
                            <img className="nav-bar-icon" src="./res/img/info-circle-fill-yellow.svg" title="새로운 업데이트가 있습니다. 앱을 재시작하면 업데이트가 진행됩니다." />
                        </li>
                    </ul>
                </ul>
                <MenuBarWindowControls ref={this.ref_menubar_ctrls}/>
            </div>
        );
    }
}