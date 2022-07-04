'use strict';

class MainContents extends React.Component {
    constructor(props) {
        super(props);
        this.__ref_contents_tasks = React.createRef();
        this.__ref_contents_accounts = React.createRef();
        this.__ref_contents_proxies = React.createRef();
    }

    render() {
        return (
            <div className="tab-content">
                <ContentsTasks ref={this.__ref_contents_tasks} contents_account_ref={this.__ref_contents_accounts} contents_proxies_ref={this.__ref_contents_proxies}/>
                <ContentsAccounts ref={this.__ref_contents_accounts}/>
                <ContentsBilling />
                <ContentsProxies ref={this.__ref_contents_proxies}/>
                <ContentsSettings />
                <ContentsTheDraw contents_task_ref={this.__ref_contents_tasks}/>
                <ContentsNewProduct contents_task_ref={this.__ref_contents_tasks}/>
                <ContentsOrderList />
                <ContentsReturnable />
            </div>
        );
    }
}