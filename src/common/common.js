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

    exports.is_valid_ip_addr = function(ip_addr) {
        const ipv46_regex = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/gm;
        return ipv46_regex.test(ip_addr);
    }
    exports.is_valid_port_number = function(prot_number) {
        return /[0-9]+/.test(prot_number);
    }

    exports.is_valid_email = function(email) {
        return String(email).toLowerCase().match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    }

    exports.is_valid_yyyymmdd = function(date_str) {
        var regex = RegExp(/^\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$/);
        return regex.test(date_str);
    }

    exports.is_valid_password = function(password){
        return String(password).match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
    }

    exports.is_valid_currency_format = function(currency_str){
        var regex = RegExp(/^(?!0\.00)[1-9]\d{0,2}(,\d{3})*(\.\d\d)?$/);
        return regex.test(currency_str);
    }

    exports.getNumberByCurrencyStr = function(currency_str){
        return parseInt(currency_str.replace(/\D/g, ''));
    }

    exports.getPriceGap = function(a, b){
        const a_price = this.getNumberByCurrencyStr(a);
        const b_price = this.getNumberByCurrencyStr(b);

        return a_price - b_price;
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

    exports.move_element = function (arr, from_idx, to_idx) {
        var element = arr[from_idx];
        arr.splice(from_idx, 1);
        arr.splice(to_idx, 0, element)
    }

    exports.merge_object = function (target, source) {

        Object.entries(source).forEach(([key, value]) =>{
            if(value == undefined) return;
            target[key] = value;
        });

        return target;
    }

    exports.get_kream_product_info_obj_scheme = function (){
        return {
            product_id : undefined,
            url : undefined,
            price: undefined,
            interest : undefined,
            options: undefined,
            _id : undefined
        };
    }

    exports.update_kream_product_info_obj = function(kream_product_info, key, value){
        if(key in this.get_kream_product_info_obj_scheme() == false){
            throw 'kream product info object is not includes property : ' + key;
        }

        kream_product_info[key] = value;
        return kream_product_info;
    }

    exports.get_thedraw_item_obj_scheme = function (){
        return {
            product_name : undefined,
            product_size : undefined,
            product_price : undefined,
            product_link : undefined,
            product_img_url : undefined,
            product_model_id : undefined,
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

    exports.get_order_info_obj_scheme = function (){
        return {
            name : undefined,
            size : undefined,
            price : undefined,
            quantity : undefined,
            url : undefined,
            img_url : undefined,
            status : undefined,
            date : undefined,
            account_email : undefined,
            account_id : undefined,
            is_cancelable : undefined,
            model_id: undefined,
            order_id : undefined,
            order_item_id : undefined,
            _id : undefined
        };
    }

    exports.update_order_info_obj = function(order_info, key, value){
        if(key in this.get_order_info_obj_scheme() == false){
            throw 'order info object is not includes property : ' + key;
        }

        order_info[key] = value;
        return order_info;
    }


    exports.get_account_info_obj_scheme = function (){
        return {
            email : undefined,
            pwd : undefined,
            locked : undefined,
            id : undefined,
            state : undefined,
        };
    }

    exports.update_account_info_obj = function(account_info, key, value){
        if(key in this.get_account_info_obj_scheme() === false){
            throw 'order info object is not includes property : ' + key;
        }

        account_info[key] = value;
        return account_info;
    }

    exports.ACCOUNT_STATE = {
        LOGIN : '로그인',
        LOGOUT : '로그아웃',
        LOCKED : '잠금상태'
    }

    exports.get_task_info_obj_scheme = function (){
        return {
            product_info : undefined,
            size_name : undefined,
            friendly_size_name : undefined,
            account_email : undefined,
            account_id : undefined,
            schedule_time : undefined,
            status: undefined,
            proxy_info : undefined,
            watchdog: undefined,
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
            released_date : undefined,
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

    exports.get_returned_info_obj_scheme = function(){
        return {
            product_name : undefined,
            account_email : undefined,
            product_img_url : undefined,
            product_model_id : undefined,
            product_option : undefined,
            product_price : undefined,
            returned_number : undefined,
            order_id : undefined,
            returned_quantity : undefined,
            returned_date : undefined,
            returned_status: undefined,
            is_cancelable: undefined,
            _id : undefined,
        };
    };

    exports.update_returned_info_obj = function(returned_info_obj, key, value){
        if(key in this.get_returned_info_obj_scheme() == false){
            throw 'returned info object is not includes property : ' + key;
        }

        returned_info_obj[key] = value;
        return returned_info_obj;
    }

    exports.get_returnable_info_obj_scheme = function(){
        return {
            product_name : undefined,
            account_email : undefined,
            product_img_url : undefined,
            product_model_id : undefined,
            product_option : undefined,
            order_price : undefined,
            order_number : undefined,
            order_id : undefined,
            order_item_id : undefined,
            returnable_quantity : undefined,
            order_date : undefined,
            _id : undefined,
        };
    };

    exports.update_returnable_info_obj = function(returnable_info_obj, key, value){
        if(key in this.get_returnable_info_obj_scheme() == false){
            throw 'returnable info object is not includes property : ' + key;
        }

        returnable_info_obj[key] = value;
        return returnable_info_obj;
    }

    exports.get_submit_returnable_obj_scheme = function(){
        return {
            use_default_return_addr : undefined,
            return_memo : undefined,
            return_reason : undefined,
            return_detail_reason : undefined,
            return_addr_info : undefined,
            _id : undefined
        };
    }

    exports.update_submit_returnable_obj = function(submit_returnable_info, key, value){
        if(key in this.get_submit_returnable_obj_scheme() == false){
            throw 'submit returnable info object is not includes property : ' + key;
        }

        submit_returnable_info[key] = value;
        return submit_returnable_info;
    }

    exports.get_user_addr_info_obj_scheme = function(){
        return {
            user_name : undefined,
            phone_number : undefined,
            address : undefined,
            address_detail : undefined,
            postal_code : undefined,
            address_id : undefined,
            city : undefined,
            _id : undefined
        };
    }

    exports.update_user_addr_info_obj = function(user_addr_info, key, value){
        if(key in this.get_user_addr_info_obj_scheme() == false){
            throw 'user addr info object is not includes property : ' + key;
        }

        user_addr_info[key] = value;
        return user_addr_info;
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

    exports.compare_version = function(a, b) {
        if (a === b) return 0;
    
        var a_components = a.split(".");
        var b_components = b.split(".");
    
        var len = Math.min(a_components.length, b_components.length);
    
        // loop while the components are equal
        for (var i = 0; i < len; i++) {
            // A bigger than B
            if (parseInt(a_components[i]) > parseInt(b_components[i]))return 1;
            // B bigger than A
            if (parseInt(a_components[i]) < parseInt(b_components[i]))return -1
        }
    
        // If one's a prefix of the other, the longer one is greater.
        if (a_components.length > b_components.length) return 1;
        if (a_components.length < b_components.length) return -1;

        // Otherwise they are the same.
        return 0;
    }

    exports.get_formatted_date_str = function(date, with_time = false){

        if(date == undefined) return '';

        const paded_time_str = (val) =>{
            return val < 10 ? '0' + val.toString() : val.toString();
        };

        var year = date.getFullYear().toString().substring(2);
        var month = paded_time_str(date.getMonth() + 1);
        var day = paded_time_str(date.getDate());

        if(with_time == false) return [year, month, day].join('.');

        var hour = paded_time_str(date.getHours());
        var min = paded_time_str(date.getMinutes());
        var seconds = paded_time_str(date.getSeconds());

        return [year, month, day].join('.') + ' ' + [hour, min, seconds].join(':');
    }

    exports.get_YYYYMMDDhhmmss = function(date){

        if(date == undefined) return '';

        const paded_time_str = (val) =>{
            return val < 10 ? '0' + val.toString() : val.toString();
        };

        var year = date.getFullYear().toString();
        var month = paded_time_str(date.getMonth() + 1);
        var day = paded_time_str(date.getDate());

        var hour = paded_time_str(date.getHours());
        var min = paded_time_str(date.getMinutes());
        var seconds = paded_time_str(date.getSeconds());

        return [year, month, day, hour, min, seconds].join('');
    }

    exports.format_seconds = (secs) => {
        const pad = (n) => n < 10 ? `0${n}` : n;
      
        const h = Math.floor(secs / 3600);
        const m = Math.floor(secs / 60) - (h * 60);
        const s = Math.floor(secs - h * 3600 - m * 60);
      
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
      }

    exports.add_minutes = function(date, minutes){
        return new Date(date.getTime() + minutes*60000);
    }

    exports.get_log_str = function(module_name, function_name, message){
        return `[${module_name}] [${function_name}] ${message}`;
    }

    exports.get_random_int = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }

    exports.sample = function(items) {
        return items[Math.floor(Math.random()*items.length)];
    }

    exports.print_time_duration = function(log, message, before_time){
        const cur_time = Date.now();
        log.info(this.get_log_str('task.js', 'PERPORMANCE', message + ': ' + (cur_time - before_time)));
        return cur_time;
    }

    exports.NIKE_URL = 'https://www.nike.com';

    exports.SELL_TYPE = {
        normal : 'Buy', 
        ftfs :'Coming Soon', 
        draw : 'THE DRAW', 
        notify :'Notify Me',
        custom: 'Custom'
    };

    exports.SPECIAL_SIZE_OPTS = {
        MIDDLE : '중간', 
        RANDOM : '무작위'
    };
    
    exports.TASK_STATUS = {
        READY : '준비중', //아직 open time이 전이라 play 할 수 없는 상태임.
        PAUSE : '중지됨',
        PAUSE_PENDING : '작업 정지 대기 중',
        PLAY : '시작됨',
        WAITING_FOR_OTHER_TASK : '다른 작업 기다리는 중',
        FAIL : '실패',
        DONE : '작업 완료',
        TRY_TO_LOGIN : '로그인 하는 중',
        TRY_TO_RETRY : '재시도 하는 중',
        ON_PAGE : '상품 페이지 여는 중',
        WAITING_FOR_RELEASE : '상품 입고 대기 중',
        ADD_TO_CART : '카트에 넣는 중',
        IN_TO_CART : '카트에 담기 완료',
        PREPARE_ORDER : '주문결제 준비 중',
        TRY_TO_DRAW : 'THE DRAW 준비 중',
        GET_PRODUCT_INFO : '상품 정보 확인 중',
        TRY_TO_PAY : '주문결제 요청 중',
        READY_TO_PAY : '주문결제 대기 중',
        CHECK_IS_WIN : 'DRAW 결과 확인 중',
    };

})(typeof exports === 'undefined'? this['common']={}: exports);