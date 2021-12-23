'use strict';

const e = React.createElement;

const SystemMessageQueue = React.createContext();

class Index extends React.Component {

    static g_sys_msg_q = new ToastMessageQueue(10000);
    static g_product_mngr = new ProductManager();
    static g_server_clock = new ServerClock();
    static g_prompt_modal = new PromptModalHandler();
    static g_billing_info = undefined;
    static g_settings_info = new AppSettings();

    constructor(props) {
        super(props);

        this.prompt_modal_ref = React.createRef();
        Index.g_prompt_modal.setModalRef(this.prompt_modal_ref);

        this.state = {
            sys_msg_q : Index.g_sys_msg_q
        };
    }

    render() {
        return (
            <div>
                <PromptModal ref={this.prompt_modal_ref}/>
                <Toast sys_msg_q={this.state.sys_msg_q}/>
                <SignInPage/>
                {/* <MenuBar/>
                <MainContents /> */}
            </div>
        );
    }
}

const domContainer = document.querySelector('#index-container');
ReactDOM.render(e(Index), domContainer);