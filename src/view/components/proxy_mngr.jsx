
class ProxyManager{
    
    static getPropertyList(property, proxy_info_list){

        let list = [];

        for(var i = 0; i < proxy_info_list.length; i++){
            list.push(proxy_info_list[i][property]);
        }

        return list;
    }
}