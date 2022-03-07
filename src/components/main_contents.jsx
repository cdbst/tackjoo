'use strict';

class MainContents extends React.Component {
    constructor(props) {
        super(props);
        this.__ref_contents_tasks = React.createRef();
    }

    render() {
        return (
            <div className="tab-content">
                <ContentsTasks ref={this.__ref_contents_tasks}/>
                <ContentsAccounts />
                <ContentsBilling />
                <ContentsProxies />
                <ContentsSettings />
                <ContentsTheDraw />
                <ContentsNewProduct contents_task_ref={this.__ref_contents_tasks}/>
                <ContentsCheckouts />
            </div>
        );
    }
}