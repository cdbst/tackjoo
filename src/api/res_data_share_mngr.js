
class ResDataShareManager{
    constructor(cache_timeout){

        this.subscribe = this.subscribe.bind(this);
        this.invoke_all = this.invoke_all.bind(this);
        this.register_res_data_to_cache = this.register_res_data_to_cache.bind(this);
        this.get_res_data_form_cache = this.get_res_data_form_cache.bind(this);

        this.subscriber_dict = {};
        this.res_data_cache_dict = {};
        this.cache_timeout = cache_timeout;
    }

    subscribe(request_id){

        return new Promise((resolve, reject) =>{

            const cached_res_data = this.get_res_data_form_cache(request_id);
            if(cached_res_data !== undefined) resolve(cached_res_data);

            if(request_id in this.subscriber_dict === false){
                this.subscriber_dict[request_id] = {
                    subscribers : [],
                    invoke_inprogress : false
                };
            }

            this.subscriber_dict[request_id].subscribers.push({
                resolve : resolve,
                reject : reject
            });
        });
    }

    // unsubscribe(subscriber_id){
    // 주석 해제시 아래 코드의 수정이 필요한 상황이됨.
    //     for (const [_, subscribers] of Object.entries(this.subscriber_dict)) {
    //         let found = false;
    //         for(let i = 0; i < subscribers.length; i++){
    //             const subscriber = subscribers[i];
    //             if(subscriber.id === subscriber_id){
    //                 subscriber.reject('unsubscribed');
    //                 subscribers.splice(i, 1);
    //                 found = true;
    //                 break;
    //             }
    //         }
    //         if(found) break;
    //     }
    // }

    invoke_all(request_id, res_data){
        
        if(request_id in this.subscriber_dict === false) return;
        if(this.subscriber_dict[request_id].invoke_inprogress) return;

        this.subscriber_dict[request_id].invoke_inprogress = true;
        this.register_res_data_to_cache(request_id, res_data);
        
        this.subscriber_dict[request_id].subscribers.forEach((subscriber)=>{
            subscriber.resolve(res_data);
        });
        delete this.subscriber_dict[request_id];
    }

    register_res_data_to_cache(request_id, res_data){

        if(this.cache_timeout === 0 ) return;

        this.res_data_cache_dict[request_id] = res_data;
        setInterval(()=>{
            if(request_id in this.res_data_cache_dict){
                delete this.res_data_cache_dict[request_id];
            }
        }, 10000)
    }

    get_res_data_form_cache(request_id){
        if(request_id in this.res_data_cache_dict === false) return undefined;
        else return this.res_data_cache_dict[request_id];
    }
}

module.exports.ProductInfoShareManager = new ResDataShareManager(10000);
module.exports.SkuInventoryInfoShareManager = new ResDataShareManager(0);