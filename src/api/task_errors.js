class TaskInfoError extends Error {
    constructor(task_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TaskInfoError);
        }

        this.name = 'TaskInfoError';
        this.task_info = task_info;
    }
}

class GetSkuInventoryError extends Error {
    constructor(product_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GetSkuInventoryError);
        }

        this.name = 'GetSkuInventoryError';
        this.product_info = product_info;
    }
}

class TaskCanceledError extends Error {
    constructor(task_runner, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TaskCanceledError);
        }

        this.name = 'TaskCanceledError';
        this.task_runner = task_runner;
    }
}

class ProductInfoError extends Error {
    constructor(product_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ProductInfoError);
        }
        
        this.name = 'ProductInfoError';
        this.product_info = product_info;
    }
}

class LoginError extends Error {
    constructor(browser_context, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, LoginError);
        }
        
        this.name = 'LoginError';
        this.browser_context = browser_context;
    }
}

class OpenProductPageError extends Error {
    constructor(...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, OpenProductPageError);
        }
        
        this.name = 'OpenProductPageError';
    }
}

class SizeInfoError extends Error {

    constructor(product_info, task_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SizeInfoError);
        }
        
        this.name = 'SizeInfoError';
        this.product_info = product_info;
        this.task_info = task_info;
    }
}

class ApplyDrawError extends Error {

    constructor(product_info, size_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApplyDrawError);
        }
        
        this.name = 'ApplyDrawError';
        this.product_info = product_info;
        this.size_info = size_info;
    }
}

class OpenCheckOutPageError extends Error {

    constructor(product_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, OpenCheckOutPageError);
        }
        
        this.name = 'OpenCheckOutPageError';
        this.product_info = product_info;
    }
}

class AddToCartError extends Error {

    constructor(product_info, size_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AddToCartError);
        }
        
        this.name = 'AddToCartError';
        this.product_info = product_info;
        this.size_info = size_info;
    }
}

class CheckOutSingleShipError extends Error {

    constructor(billing_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CheckOutSingleShipError);
        }
        
        this.name = 'CheckOutSingleShipError';
        this.billing_info = billing_info;
    }
}

class CheckOutRequestError extends Error {

    constructor(...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CheckOutRequestError);
        }
        
        this.name = 'CheckOutRequestError';
    }
}

class PrepareKakaoPayError extends Error {

    constructor(kakaopay_prepare_payload, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PrepareKakaoPayError);
        }
        this.kakaopay_prepare_payload = kakaopay_prepare_payload;
        this.name = 'PrepareKakaoPayError';
    }
}

class OpenPayWindowError extends Error {

    constructor(kakao_data, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, OpenPayWindowError);
        }
        this.kakao_data = kakao_data;
        this.name = 'OpenPayWindowError';
    }
}

class CheckDrawResultError extends Error {
    constructor(product_info, ...params) {
      
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CheckDrawResultError);
        }
        
        this.name = 'CheckDrawResultError';
        this.product_info = product_info;
    }
}

module.exports.TaskInfoError = TaskInfoError;
module.exports.ProductInfoError = ProductInfoError;
module.exports.OpenProductPageError = OpenProductPageError;
module.exports.SizeInfoError = SizeInfoError;
module.exports.ApplyDrawError = ApplyDrawError;
module.exports.AddToCartError = AddToCartError;
module.exports.CheckOutSingleShipError = CheckOutSingleShipError;
module.exports.CheckOutRequestError = CheckOutRequestError;
module.exports.PrepareKakaoPayError = PrepareKakaoPayError;
module.exports.OpenCheckOutPageError = OpenCheckOutPageError;
module.exports.OpenPayWindowError = OpenPayWindowError;
module.exports.TaskCanceledError = TaskCanceledError;
module.exports.LoginError = LoginError;
module.exports.GetSkuInventoryError = GetSkuInventoryError;
module.exports.CheckDrawResultError = CheckDrawResultError;