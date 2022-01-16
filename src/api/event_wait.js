const Mutex = require('async-mutex').Mutex;

class EventWait{
    constructor(){
        this.mutex = new Mutex();
        this.release = undefined;
    }

    async wait(){
        this.release = await this.mutex.acquire();
        this.release();
    }

    async set(){
        this.release = await this.mutex.acquire();
    }

    release(){
        if(this.release === undefined) this.release();
    }
}


module.exports.EventWait = EventWait;