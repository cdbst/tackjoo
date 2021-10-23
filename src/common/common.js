(function(exports){

    // Your code goes here
    exports.uuidv4 = function() {

        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    exports.get_product_info_obj_scheme = function(){

        let product_obj =  {
            name : undefined,
            alt_name : undefined,
            img_url : undefined,
            url : undefined,
            sell_type : undefined,
            category : undefined,
            open_time : undefined,
            close_time : undefined,
            price : undefined,
            size_list : [],
            sold_out : undefined,
            product_id : undefined,
            _id : undefined
        }

        return product_obj;
    }

    exports.update_product_info_obj = function(product_info_obj, key, value){
        if(key in product_info_obj == false){
            throw 'Product object is not includes property : ' + key;
        }

        product_info_obj[key] = value;
        return product_info_obj;
    }

    exports.NIKE_URL = 'https://www.nike.com';
    exports.PRODUCT_TYPE = {normal : 'Buy', ftfs :'Coming Soon', draw : 'THE DRAW'};

})(typeof exports === 'undefined'? this['common']={}: exports);