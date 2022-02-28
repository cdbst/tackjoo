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
                <ContentsSettings />
                <ContentsTheDraw />
                <ContentsNewProduct />
            </div>
        );
    }
}