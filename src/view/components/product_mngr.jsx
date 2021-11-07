// 저장하고 가지고있어야 할 제품 정보

// 제품 타입 (일반, 드로우) == 우선 신발 타입만 가져오는 것 
// 제품 판매 시작 시간
// 제품 판매 마감 시간
// 제품 이름
// 제품 판매 페이지 URL
// 제품 이미지 URL
// 제품 가격
// 구매 가능한 사이즈 
// 품절 여부
// 

// 테스트 생성시 : 출시 기간 필터링 기능 (범위 지정 UI. 동영상 재생 UI 비슷한 형식)
// 테스크 생성 방식
// 1. 우선 제품 타입을 선택 (드로우 or 일반) 
// 1-1 ? 드로우와 일반 그리고 선착순을 구별 할 수 있는 기준은?
// 2. 제품 선택 -> 제품 선택시 출시 일정 및 시간을 즉시 표현 해줘야함.
// 2-1. 제품 선택시 제품 선택 페이지에서 흭득가능한 정보들을 불러오도록 처리한다. (구매 가능한 사이즈, 가격, 응모 시간)

// 3. 사이즈 선택 (사이즈 정보를 아직 취득할 수 없다면, 희망 사이즈를 입력 받을 수 있는 UI)
// 4. Tsak를 예약 할지 말지 결정 가능항 라디오 버튼 타입의 UI 표현
// 5 : 위와 같은 테스크를 어떠한 계정으로 진행할지 설정 (복수개의 계정을 지정 가능, 로그인 된 게정만)
// 6. 자동 구매 기능 사용 여부 (라디오 버튼)
// 7. 생성해 놓은 task를 local에 저장하고 불러오는 기능 ()

class ProductManager{

    constructor(){

        this.loadProductInfoList = this.loadProductInfoList.bind(this);
        this.__poolProductInfo = this.__poolProductInfo.bind(this);
        this.getProductInfoList = this.getProductInfoList.bind(this);
        this.getProductInfo = this.getProductInfo.bind(this);
        this.__updateProductInfo = this.__updateProductInfo.bind(this);
        this.getValueList = this.getValueList.bind(this);

        this.getProductSizeList =this.getProductSizeList.bind(this);
        this.__getDefaultSizeNameList = this.__getDefaultSizeNameList.bind(this);

        this.__product_info_list = [];
        this.__product_info_req_gate = new RequestGate();

        this.loadProductInfoList();
    }

    /**
     * 'feed' page(https://www.nike.com/kr/launch/)에서 제품 정보를 가져옵니다.
     */
    loadProductInfoList(__callback = undefined){

        window.electron.getProductInfoList((error, product_info_list)=>{

            if(error != undefined){
                Index.g_sys_msg_q.enqueue('Error', 'Cannot load product information.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                if(__callback != undefined) __callback('Cannot load product information.', undefined);
                return;
            };

            product_info_list.forEach((_product_info) =>{

                let product_info = common.get_product_info_obj_scheme();
                product_info = common.merge_object(product_info, _product_info);
                common.update_product_info_obj(product_info, '_id', common.uuidv4());
                this.__product_info_list.push(product_info);
            });

            if(__callback != undefined) __callback(undefined, this.__product_info_list);

            Index.g_sys_msg_q.enqueue('Loading Product Information', 'Product information has been loaded successfully.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
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
            if(__subscriber) __subscriber('Cannot found product information ..', undefined);
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

    getValueList(product_info_list, attr_name, duplicate = true){
        let value_list = product_info_list.map((product_info) => product_info[attr_name]);
        if(duplicate) return value_list;
        return [...new Set(value_list)];
    }

    getProductSizeList(product_info){

        let size_list = undefined;

        if(product_info != undefined && product_info.size_info_list.length > 0){
            if(product_info.sell_type == common.SELL_TYPE.draw){
                size_list = product_info['size_info_list'].map((size_info) => size_info.name);
            }else{
                size_list = product_info['size_info_list'].filter((size_info) => {return size_info.quantity > 0}).map((size_info) => size_info.name);
            }
            
        }else if(product_info != undefined){
            size_list = this.__getDefaultSizeNameList();
        }else{
            size_list = [];
        }

        return size_list
    }

    __getDefaultSizeNameList(){
        const size_num = 20;
        const base_size = 200;
        let size_names = [];

        for(var i = 0; i < size_num; i++){
            size_names.push((base_size + i * 5).toString());
        }
        return size_names;
    }

    static getProductDescName(product_info){
        return product_info.name + ' (' + product_info.alt_name + ')';
    }

    static getProductDescNameList(product_info_list){
        return product_info_list.map((product_info) => ProductManager.getProductDescName(product_info) );
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
}