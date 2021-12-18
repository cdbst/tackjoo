(function(exports){

    // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
    exports.uuidv4 = function() {

        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    exports.async_sleep = function(time_out) {
        return new Promise((resolve, reject) =>{
            try{
                setTimeout(()=>{
                    resolve();
                }, time_out);
            }catch(e){
                reject(e);
            }
        });
    }

    exports.merge_object = function (target, source) {
        //console.log(source);

        Object.entries(source).forEach(([key, value]) =>{
            if(value == undefined) return;
            target[key] = value;
        });

        return target;
    }

    exports.get_thedraw_item_obj_scheme = function (){
        return {
            product_name : undefined,
            product_size : undefined,
            product_price : undefined,
            product_link : undefined,
            draw_result : undefined,
            draw_date : undefined,
            account_email : undefined,
            account_pwd : undefined,
            _id : undefined
        };
    }

    exports.update_thedraw_item_obj = function(thedraw_item, key, value){
        if(key in this.get_thedraw_item_obj_scheme() == false){
            throw 'thedraw item object is not includes property : ' + key;
        }

        thedraw_item[key] = value;
        return thedraw_item;
    }

    exports.get_task_info_obj_scheme = function (){
        return {
            product_info_id : undefined,
            size_name : undefined,
            friendly_size_name : undefined,
            account_email : undefined,
            account_id : undefined,
            schedule_time : undefined,
            status: undefined,
            proxy_info : undefined,
            _id : undefined
        };
    }

    exports.update_task_info_obj = function(task_info_obj, key, value){
        if(key in this.get_task_info_obj_scheme() == false){
            throw 'task info object is not includes property : ' + key;
        }

        task_info_obj[key] = value;
        return task_info_obj;
    }

    exports.get_size_info_obj_scheme = function (){
        return {
            name : undefined,
            friendly_name : undefined,
            sku_id : undefined,
            price : undefined,
            quantity : undefined,
            id : undefined,
            external_id : undefined,
            draw_product_xref : undefined,
            draw_sku_xref : undefined,
        }
    }

    exports.update_size_info_obj = function(size_info_obj, key, value){
        if(key in this.get_size_info_obj_scheme() == false){
            throw 'size info object is not includes property : ' + key;
        }

        size_info_obj[key] = value;
        return size_info_obj;
    }

    exports.get_product_info_obj_scheme = function(){

        return {
            name : undefined,
            alt_name : undefined,
            img_url : undefined,
            url : undefined,
            sell_type : undefined,
            category : undefined,
            open_time : undefined,
            close_time : undefined,
            price : undefined,
            size_info_list : [],
            soldout : undefined,
            product_id : undefined,
            model_id : undefined,
            draw_id : undefined,
            item_attr : undefined,
            product_options : undefined,
            _id : undefined
        };
    }

    exports.update_product_info_obj = function(product_info_obj, key, value){
        if(key in this.get_product_info_obj_scheme() == false){
            throw 'Product object is not includes property : ' + key;
        }

        product_info_obj[key] = value;
        return product_info_obj;
    }

    exports.getValuesFromObjList = function(obj_list, key, value_refiner = undefined){
        const values = [];

        obj_list.forEach((obj) =>{
            let value = obj[key];
            if(value_refiner){
                value = value_refiner(value);
            }
            if(values.includes(value) == false) values.push(value);
        });

        return values;
    }

    exports.get_formatted_date_str = function(date, with_time = false){

        if(date == undefined) return '';

        const paded_time_str = (val) =>{
            return val < 10 ? '0' + val.toString() : val.toString();
        };

        var year = date.getFullYear().toString();
        var month = paded_time_str(date.getMonth() + 1);
        var day = paded_time_str(date.getDate());

        if(with_time == false) return [year, month, day].join('-');

        var hour = paded_time_str(date.getHours());
        var min = paded_time_str(date.getMinutes());
        var seconds = paded_time_str(date.getSeconds());

        return [year, month, day].join('-') + ' ' + [hour, min, seconds].join(':');
    }

    exports.get_log_str = function(module_name, function_name, message){
        return `[${module_name}] [${function_name}] ${message}`;
    }

    exports.get_random_int = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }

    exports.NIKE_URL = 'https://www.nike.com';
    exports.SELL_TYPE = {normal : 'Buy', ftfs :'Coming Soon', draw : 'THE DRAW', notify :'Notify Me'};
    exports.TASK_STATUS = {
        READY : '준비중', //아직 open time이 전이라 play 할 수 없는 상태임.
        PAUSE : '중지됨',
        PLAY : '시작됨',
        WAITING_FOR_OTHER_TASK : '다른 작업 기다리는 중',
        FAIL : '실패',
        DONE : '작업 완료',
        TRY_TO_LOGIN : '로그인 하는 중',
        TRY_TO_RETRY : '재시도 하는 중',
        ON_PAGE : '상품 페이지 여는 중',
        ADD_TO_CART : '카트에 넣는 중',
        TRY_TO_DRAW : 'THE DRAW 준비 중',
        GET_PRODUCT_INFO : '상품 정보 얻는 중',
        TRY_TO_PAY : '결제 시도 중',
        READY_TO_PAY : '결제 대기 중'
    };

})(typeof exports === 'undefined'? this['common']={}: exports);