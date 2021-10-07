'use strict';

const e = React.createElement;

const SystemMessageQueue = React.createContext();

class Index extends React.Component {

    constructor(props) {
        super(props);

        let _sys_msg_q = new ToastMessageQueue(10000);
        _sys_msg_q.enqueue('abcd', 'dddd', 'warn');

        this.state = {
            sys_msg_q : _sys_msg_q
        };
    }

    render() {
        return (
            <div>
                <Toast sys_msg_q={this.state.sys_msg_q}/>
                <MenuBar/>
                <MainContents sys_msg_q={this.state.sys_msg_q}/>
            </div>
        );
    }
}

const domContainer = document.querySelector('#index-container');
ReactDOM.render(e(Index), domContainer);