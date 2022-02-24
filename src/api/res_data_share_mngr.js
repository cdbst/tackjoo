const { BrowserContext } = require("./browser_context");

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

    subscribe(product_info){
        
        const product_id = product_info.product_id;

        return new Promise(async (resolve, reject) =>{

            const cached_res_data = this.get_res_data_form_cache(product_id);
            if(cached_res_data !== undefined) resolve(cached_res_data);

            const subscriber = {
                resolve : resolve,
                reject : reject
            };

            if(product_id in this.subscriber_dict === false){
                this.subscriber_dict[product_id] = {
                    subscribers : [subscriber],
                    borwser_context : undefined
                };

                this.subscriber_dict[product_id].borwser_context = new BrowserContext();
                const sku_inventory_info = await this.subscriber_dict[product_id].borwser_context.get_product_sku_inventory(product_info.url, product_info);
                this.invoke_all(product_id, sku_inventory_info);
            }else{
                this.subscriber_dict[product_id].subscribers.push(subscriber);
            }
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

    invoke_all(product_id, sku_inventory_info){
        
        if(product_id in this.subscriber_dict === false) return;
        
        this.register_res_data_to_cache(product_id, sku_inventory_info);
        
        this.subscriber_dict[product_id].subscribers.forEach((subscriber)=>{
            subscriber.resolve(sku_inventory_info);
        });
        delete this.subscriber_dict[product_id];
    }

    register_res_data_to_cache(product_id, sku_inventory_info){

        if(this.cache_timeout === 0 ) return;

        this.res_data_cache_dict[product_id] = sku_inventory_info;
        setTimeout(()=>{
            if(product_id in this.res_data_cache_dict){
                delete this.res_data_cache_dict[product_id];
            }
        }, this.cache_timeout);
    }

    get_res_data_form_cache(product_id){
        if(product_id in this.res_data_cache_dict === false) return undefined;
        else return this.res_data_cache_dict[product_id];
    }
}

module.exports.SkuInventoryInfoShareManager = new ResDataShareManager(5000);
