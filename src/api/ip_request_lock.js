const { Semaphore } = require("async-mutex");

class IPRequestLock{

    constructor(){
        this.__max_num_http_req = 3;
        this.__ip_semaphore_dict = {}
    }

    set_max_num_http_req(value){
        this.__max_num_http_req = value;
    }

    __get_proxy_addr(proxy_ip, proxy_port){
        if(proxy_ip == undefined || proxy_port == undefined) return '*'
        else return `${proxy_ip}:${proxy_port}`;
    }

    async accquire(proxy_ip, proxy_port){

        const proxy_addr = this.__get_proxy_addr(proxy_ip, proxy_port);

        if(proxy_addr in this.__ip_semaphore_dict == false){
            this.__ip_semaphore_dict[proxy_addr] = {
                semaphore : undefined,
                release_list : []
            };
            this.__ip_semaphore_dict[proxy_addr].semaphore = new Semaphore(this.__max_num_http_req);
        }

        const [_value, release] = await this.__ip_semaphore_dict[proxy_addr].semaphore.acquire();
        this.__ip_semaphore_dict[proxy_addr].release_list.push(release);
    }

    release(proxy_ip, proxy_port){
        const proxy_addr = this.__get_proxy_addr(proxy_ip, proxy_port);
        const release = this.__ip_semaphore_dict[proxy_addr].release_list.pop();
        release();
    }
}

module.exports.IPRequestLock = new IPRequestLock();