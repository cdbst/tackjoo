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

        this.updateProductInfo = this.updateProductInfo.bind(this);
        this.__poolProductInfo = this.__poolProductInfo.bind(this);
        this.getProductList = this.getProductList.bind(this);
        this.getProductInfo = this.getProductInfo.bind(this);

        this.__products = []

        this.updateProductInfo();
    }

    /**
     * 'feed' page(https://www.nike.com/kr/launch/)에서 제품 정보를 가져옵니다.
     */
    updateProductInfo(__callback = undefined){

        window.electron.getProductList((error, product_info_list)=>{

            if(error != undefined){
                //Index.g_sys_msg_q.enqueue('Error', 'Cannot load product information.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                if(__callback != undefined) __callback('Cannot load product information.', undefined);
                return;
            };

            product_info_list.forEach((_product_info) =>{

                let product_info = common.get_product_info_obj_scheme();
                product_info = Object.assign(product_info, _product_info);
                common.update_product_info_obj(product_info, '_id', common.uuidv4())
                this.__products.push(product_info);
            });

            if(__callback != undefined) __callback(undefined, this.__products);

            //Index.g_sys_msg_q.enqueue('Loading Product Information', 'Product information has been loaded successfully.', ToastMessageQueue.TOAST_MSG_TYPE.INFO, 5000);
        });
    }

    getProductInfo(_id, __callback){
        
        let product_obj = this.__products.find((product) => { return product._id === _id});

        if(product_obj == undefined){
            __callback('Cannot found product information ..', undefined);
            return;
        }

        window.electron.getProductInfo(product_obj.url, (error, product_info) =>{
            __callback(error, product_info);
        });
    }

    /**
     * 새로운 제품 정보를 가져오기 위해 일정 주기(설정 값)마다 polling 합니다.
     */
    __poolProductInfo(){

    }

    getProductList(){
        return this.__products;
    }

}