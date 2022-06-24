class ProductManager{

    constructor(){

        this.loadProductInfoList = this.loadProductInfoList.bind(this);
        this.__poolProductInfo = this.__poolProductInfo.bind(this);
        this.getProductInfoList = this.getProductInfoList.bind(this);
        this.getProductInfo = this.getProductInfo.bind(this);
        this.__updateProductInfo = this.__updateProductInfo.bind(this);
        this.__sortProductInfoList = this.__sortProductInfoList.bind(this);

        this.__product_info_list = [];
        this.__product_info_req_gate = new RequestGate();
    }

    /**
     * 'feed' page(https://www.nike.com/kr/launch/)에서 제품 정보를 가져옵니다.
     */
    loadProductInfoList(__callback = undefined){

        window.electron.getProductInfoList((error, product_info_list)=>{

            if(error != undefined){
                Index.g_sys_msg_q.enqueue('에러', '상품 정보를 읽는데 실패하였습니다.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                if(__callback != undefined) __callback('상품 정보를 읽는데 실패하였습니다.', undefined);
                return;
            };

            this.__product_info_list = [];

            product_info_list.forEach((_product_info) =>{

                let product_info = common.get_product_info_obj_scheme();
                product_info = common.merge_object(product_info, _product_info);
                common.update_product_info_obj(product_info, '_id', common.uuidv4());
                this.__product_info_list.push(product_info);
            });

            this.__sortProductInfoList();

            if(__callback != undefined) __callback(undefined, this.__product_info_list);

            Index.g_sys_msg_q.enqueue('안내', '상품 정보를 성공적으로 읽었습니다.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 3000);
        });
    }

    __sortProductInfoList(){
        this.__product_info_list.sort((a, b)=>{
            return a.open_time.getTime() - b.open_time.getTime();
        });
    }

    __updateProductInfo(_id, product_info){
        for(var i = 0; i < this.__product_info_list.length; i++){
            if(this.__product_info_list[i]._id != _id) continue;
            this.__product_info_list[i] = common.merge_object(this.__product_info_list[i], product_info);
            return this.__product_info_list[i];
        }
    }

    getProductInfo(_id, __subscriber){
        
        let product_obj = this.__product_info_list.find((product) => { return product._id === _id});

        if(product_obj == undefined){
            if(__subscriber) __subscriber('상품 정보를 읽을수 없습니다.', undefined);
            return undefined;
        }

        if (__subscriber == undefined) return product_obj;

        
        if(this.__product_info_req_gate.isRequstOnPending(_id)){
            this.__product_info_req_gate.subscribe(_id, __subscriber);
            return;
        }else{
            this.__product_info_req_gate.subscribe(_id, __subscriber);
            window.electron.getProductInfo(product_obj.url, (error, product_info) =>{
                //TODO 예외처리 방법에 대한 로직 새로 생각해야함. task 로직 구현과 관련해서 생각 필요.
                if(product_info == undefined){
                    this.__product_info_req_gate.notify(product_obj._id, error, product_obj);
                    return;
                }
            
                //update product info
                let updated_product_info = this.__updateProductInfo(_id, product_info);
                this.__product_info_req_gate.notify(updated_product_info._id, error, updated_product_info);
            });
        }
    }

    /**
     * 새로운 제품 정보를 가져오기 위해 일정 주기(설정 값)마다 polling 합니다.
     */
    __poolProductInfo(){

    }

    getProductInfoList(){
        return this.__product_info_list;
    }

    static getValueList(product_info_list, attr_name, duplicate = true){
        let value_list = product_info_list.map((product_info) => product_info[attr_name]);
        if(duplicate) return value_list;
        return [...new Set(value_list)];
    }

    static getProductSizeList(product_info){

        let size_list = undefined;
        let soldout_size_list = [];

        if(product_info != undefined && product_info.size_info_list != undefined && product_info.size_info_list.length > 0){
            if(product_info.sell_type == common.SELL_TYPE.draw){
                size_list = product_info['size_info_list'].map((size_info) => size_info.friendly_name);
            }else{
                size_list = product_info['size_info_list'].filter((size_info) => {return size_info.quantity > 0}).map((size_info) => size_info.friendly_name);
                soldout_size_list = product_info['size_info_list'].filter((size_info) => {return size_info.quantity === 0}).map((size_info) => size_info.friendly_name);
            }
            
        }else if(product_info != undefined){
            size_list = ProductManager.getDefaultSizeNameList(product_info);
        }else{
            size_list = [];
        }

        return [size_list, soldout_size_list]
    }

    static getDefaultSizeNameList(product_info){
        const size_num = 55;
        const base_size = 50;
        let size_names = [];
        
        if(product_info.sell_type == common.SELL_TYPE.draw){
            size_names = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        }

        for(var i = 0; i < size_num; i++){
            size_names.push((base_size + i * 5).toString());
        }
        return size_names;
    }

    static getProductDescName(product_info, with_sell_date = false){

        let open_date_str = undefined;

        if(with_sell_date){
            open_date_str = product_info.open_time === undefined ? undefined : common.get_formatted_date_str(product_info.open_time, false);
        }
        
        if(product_info.alt_name === undefined || product_info.alt_name === ''){
            return open_date_str === undefined ? product_info.name : `[${open_date_str}] ${product_info.name}`;
        }else{
            const product_name =  product_info.name + ' (' + product_info.alt_name + ')';
            return open_date_str === undefined ? product_name : `[${open_date_str}] ${product_name}`;
        }
    }

    static getProductDescNameList(product_info_list, with_sell_date = false){
        return product_info_list.map((product_info) => ProductManager.getProductDescName(product_info, with_sell_date) );
    }

    static isValidProductInfoToTasking(product_info){

        if(product_info == undefined) return false;
        if(product_info.soldout == undefined || product_info.soldout == true) return false;
    
        if(product_info.size_info_list.length == 0) return false;

        if(product_info.sell_type == common.SELL_TYPE.draw) return true;

        let has_quantity = false;
        for(var i = 0; i < product_info.size_info_list.length; i++){
            let size_info = product_info.size_info_list[i];
            if(size_info.quantity == 1){
                has_quantity = true;
                break;
            }
        }

        return has_quantity;
    }

    static get_friendly_size_name_by_size_name(product_info, size_name){
        let friendly_name = undefined;

        for(var i = 0; i < product_info.size_info_list.length; i++){
            let size_info = product_info.size_info_list[i];
            if(size_info.name == size_name){
                friendly_name = size_info.friendly_name;
                break;
            }
        }

        return friendly_name == undefined ? size_name : friendly_name;
    }

    static get_size_name_by_friendly_size_name(product_info, friendly_name){

        if(friendly_name === common.SPECIAL_SIZE_OPTS.MIDDLE) return common.SPECIAL_SIZE_OPTS.MIDDLE;
        if(friendly_name === common.SPECIAL_SIZE_OPTS.RANDOM) return common.SPECIAL_SIZE_OPTS.RANDOM;

        let size_name = undefined;

        for(var i = 0; i < product_info.size_info_list.length; i++){
            let size_info = product_info.size_info_list[i];
            if(size_info.friendly_name == friendly_name){
                size_name = size_info.name;
                break;
            }
        }

        return size_name == undefined ? friendly_name : size_name;
    }

    static getCustomProductInfo(product_url){
        const product_info = common.get_product_info_obj_scheme();
        common.update_product_info_obj(product_info, 'name', '');
        common.update_product_info_obj(product_info, 'alt_name', '');
        common.update_product_info_obj(product_info, 'sell_type', common.SELL_TYPE.custom);
        common.update_product_info_obj(product_info, 'url', product_url);
        common.update_product_info_obj(product_info, 'img_url', './res/img/new-product.png');
        common.update_product_info_obj(product_info, 'price', '');
        common.update_product_info_obj(product_info, '_id', common.uuidv4());
        return product_info;
    }
}