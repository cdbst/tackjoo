/**
 * Election api request gate for prevent duplicated request within very shorten times.
 */
class RequestGate{
    constructor(){
        this.subscribe = this.subscribe.bind(this);
        this.notify = this.notify.bind(this);

        this.queue = {};
    }

    subscribe(_id, subscriber){
        if(_id in this.queue == false){
            this.queue[_id] = [];
        }

        this.queue[_id].push(subscriber);
    }

    notify(_id, error, data){
        let subscribers = [...this.queue[_id]];
        this.queue[_id] = [];
        subscribers.forEach((subscriber) =>{
            subscriber(error, data);
        });
    }

    isRequstOnPending(_id){
        if(_id in this.queue == false) return false;
        return this.queue[_id].length > 0;
    }
}