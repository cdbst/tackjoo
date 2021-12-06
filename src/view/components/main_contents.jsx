'use strict';

class MainContents extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="tab-content">
                <ContentsTasks />
                <ContentsAccounts />
                <ContentsBilling />
                <ContentsProxies />
                <div className="tab-pane fade" id="settings" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.SETTINGS}>Settings</div>
            </div>
        );
    }
}