'use strict';

const e = React.createElement;

const SystemMessageQueue = React.createContext();

class Index extends React.Component {

    static g_sys_msg_q = new ToastMessageQueue(10000);
    static g_product_mngr = new ProductManager();
    static g_server_clock = new ServerClock();

    constructor(props) {
        super(props);

        this.state = {
            sys_msg_q : Index.g_sys_msg_q
        };
    }

    render() {
        return (
            <div>
                <Toast sys_msg_q={this.state.sys_msg_q}/>
                <MenuBar/>
                <MainContents />
            </div>
        );
    }
}

const domContainer = document.querySelector('#index-container');
ReactDOM.render(e(Index), domContainer);