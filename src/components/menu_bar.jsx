'use strict';

class MenuBar extends React.Component {

    static MENU_ID = {
        BILLING : "billing-tab",
        TASKS : "tasks-tab",
        ACCOUNTS : "accounts-tab",
        PROXIES : "proxies-tab",
        SETTINGS : "settings-tab",
        THEDRAW : "thedraw-tab",
    }

    constructor(props) {
        super(props);

        this.serverTimeAlamListener = this.serverTimeAlamListener.bind(this);

        this.state = {
            server_time : common.get_formatted_date_str(new Date(), true)
        }

        this.__mount = false;
        Index.g_server_clock.subscribeAlam(undefined, this.serverTimeAlamListener);
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
                        <a className="nav-link active" id={MenuBar.MENU_ID.TASKS} data-bs-toggle="tab" href="#tasks" role="tab" aria-controls="tasks" aria-selected="true">Tasks</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.ACCOUNTS} data-bs-toggle="tab" href="#accounts" role="tab" aria-controls="accounts" aria-selected="false">Accounts</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.BILLING} data-bs-toggle="tab" href="#billing" role="tab" aria-controls="billing" aria-selected="false">Billing</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.PROXIES} data-bs-toggle="tab" href="#proxies" role="tab" aria-controls="proxies" aria-selected="false">Proxies</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.SETTINGS} data-bs-toggle="tab" href="#settings" role="tab" aria-controls="settings" aria-selected="false">Settings</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id={MenuBar.MENU_ID.THEDRAW} data-bs-toggle="tab" href="#thedraw" role="tab" aria-controls="thedraw" aria-selected="false">THEDRAW</a>
                    </li>
                    <ul className="nav justify-content-end" style={{width:'calc(100% - 560px)'}}>
                        <li className="nav-item">
                            <a className="nav-link">{this.state.server_time}</a>
                        </li>
                    </ul>
                </ul>
            </div>
        );
    }
}