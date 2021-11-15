'use strict';

class MainContents extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="tab-content">

                <div className="tab-pane fade show active" id="tasks" role="tabpanel" aria-labelledby="tasks-tab">
                    <ContentsTasks />
                </div>
                <div className="tab-pane fade" id="accounts" role="tabpanel" aria-labelledby="accounts-tab">
                    <ContentsAccounts />
                </div>
                <div className="tab-pane fade" id="billing" role="tabpanel" aria-labelledby="billing-tab">
                    <ContentsBilling />
                </div>
                <div className="tab-pane fade" id="proxies" role="tabpanel" aria-labelledby="proxies-tab">Proxies</div>
                <div className="tab-pane fade" id="settings" role="tabpanel" aria-labelledby="settings-tab">Settings</div>
            </div>
        );
    }
}