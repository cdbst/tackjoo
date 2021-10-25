(function(exports){

    // Your code goes here
    exports.uuidv4 = function() {

        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    exports.merge_object = function (target, source) {
        //console.log(source);

        Object.entries(source).forEach(([key, value]) =>{
            if(value == undefined) return;
            target[key] = value;
        });

        return target;
    }

    exports.get_size_info_obj_scheme = function (){
        return {
            name : undefined,
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
            throw 'Product object is not includes property : ' + key;
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
            draw_id : undefined,
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

    exports.get_formatted_date_str = function(date){

        if(date == undefined) return '';

        let paded_str = (val) =>{
            return val < 10 ? '0' + val.toString() : val.toString()
        }

        var year = (date.getFullYear() % 100).toString();
        var month = paded_str(date.getMonth() + 1);
        var day = paded_str(date.getDate());
        var hour = paded_str(date.getHours());
        var min = paded_str(date.getMinutes());
        var seconds = paded_str(date.getSeconds());

        return [year, month, day].join('.') + ' ' + [hour, min, seconds].join(':');
    }


    exports.NIKE_URL = 'https://www.nike.com';
    exports.SELL_TYPE = {normal : 'Buy', ftfs :'Coming Soon', draw : 'THE DRAW'};

})(typeof exports === 'undefined'? this['common']={}: exports);