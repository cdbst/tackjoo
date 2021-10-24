

class Toast extends React.Component {

    constructor(props) {
        super(props);

        this.onQueueChanged = this.onQueueChanged.bind(this);
        this.getToastItems = this.getToastItems.bind(this);
        this.showToastItem = this.showToastItem.bind(this);

        let _toast_items = this.getToastItems(this.props.sys_msg_q.queue);

        this.state = {
            toast_items : _toast_items
        }
        
        this.props.sys_msg_q.add_event_listener(this.onQueueChanged);
    }

    onQueueChanged(added, msg_item){

        let _toast_items = this.getToastItems(this.props.sys_msg_q.queue);

        this.setState({toast_items : _toast_items}, () => {
            if(added) this.showToastItem(msg_item);
        });
        
    }

    getToastItems(msgs){

        return msgs.map((msg) => 
            <ToastItem 
                key={msg.id}
                id={msg.id}
                title={msg.title} 
                contents={msg.contents}
                delay={msg.delay}
                type={msg.type}
            />
        );
    }

    showToastItem(_msg_item){

        var el_toast = document.getElementById(_msg_item.id);
        if(el_toast == null) return;

        var b_obj_toast = bootstrap.Toast.getOrCreateInstance(el_toast);
        b_obj_toast.show();
    }

    render() {
        return (
            <div aria-live="polite" aria-atomic="true" className="position-relative" >
                <div className="toast-container position-absolute top-0 end-0 p-3">
                    {this.state.toast_items}
                </div>
            </div>
        );
    }
}

class ToastItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        let delay = this.props.delay.toString();
        let hdr_class_name = "toast-header-" + this.props.type;
        
        return(
            <div className="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true" id={this.props.id} data-bs-delay={delay}>
                <div className={"toast-header " + hdr_class_name}>
                
                    <strong className="me-auto">{this.props.title}</strong>
                    {/* <small className="text-muted">just now</small> */}
                    <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div className="toast-body">
                    {this.props.contents}
                </div>
            </div>
        )
    }
}

class ToastMessageQueue {

    static TOAST_MSG_TYPE = {
        WARN : 'warn',
        ERR : 'error',
        INFO : 'info'
    }

    constructor(_delay, h_q_evt){

        this.enqueue = this.enqueue.bind(this);
        this.dequeue = this.dequeue.bind(this);
        this.add_event_listener = this.add_event_listener.bind(this);

        this.queue = [];
        this.delay = _delay;
        this.h_q_evt = undefined;
    }

    add_event_listener(e_handler){
        this.h_q_evt = e_handler;
    }

    enqueue(_title, _contents, _type, _delay = undefined){

        let _id = common.uuidv4();
        let dequeue = this.dequeue;
        let dq_delay = _delay == undefined ? this.delay : _delay;

        let msg = {
            title : _title,
            contents : _contents,
            type : _type,
            id : _id,
            delay: dq_delay
        }

        this.queue.push(msg);

        setTimeout(()=>{
            dequeue(_id, msg);
        }, dq_delay + 1000);

        if(this.h_q_evt != undefined){
            this.h_q_evt(true, msg);
        }
    }

    dequeue(_id, _msg){
        this.queue = this.queue.filter(message_info =>{
            return message_info.id != _id
        });

        if(this.h_q_evt != undefined){
            this.h_q_evt(false, _msg);
        }
    }

    diff(diff_with){

        if(diff_with.messages.length != this.messages.length) return false;

        for(var i = 0; i < this.queue.length; i++){
            let exist = diff_with.messages.filter((msg_info) =>{return msg_info.id != this.queue[i].id});
            if(exist.length == 0) return false;
        }

        return true;
    }
}