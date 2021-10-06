'use strict';

class MenuBar extends React.Component {
    constructor(props) {
        super(props);
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
                </ul>
            </div>
        );
    }
}