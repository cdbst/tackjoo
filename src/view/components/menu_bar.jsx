'use strict';

class MenuBar extends React.Component {
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
                    <li className="nav-item disabled" tabIndex="-1">
                        <a className="nav-link" >SNKRS BOT</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link active" id="tasks-tab" data-bs-toggle="tab" href="#tasks" role="tab" aria-controls="tasks" aria-selected="true">Tasks</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="accounts-tab" data-bs-toggle="tab" href="#accounts" role="tab" aria-controls="accounts" aria-selected="false">Accounts</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="billing-tab" data-bs-toggle="tab" href="#billing" role="tab" aria-controls="billing" aria-selected="false">Billing</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="proxies-tab" data-bs-toggle="tab" href="#proxies" role="tab" aria-controls="proxies" aria-selected="false">Proxies</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="settings-tab" data-bs-toggle="tab" href="#settings" role="tab" aria-controls="settings" aria-selected="false">Settings</a>
                    </li>
                    <ul className="nav justify-content-end">
                        <li>
                            <div style={{marginRight:16}}>
                                <span>{this.state.server_time}</span>
                            </div>
                        </li>
                    </ul>
                </ul>
                
            </div>
        );
    }
}