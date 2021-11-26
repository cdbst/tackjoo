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
            Error.captureStackTrace(this, OpenProductPageError);
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
            Error.captureStackTrace(this, OpenProductPageError);
        }
        
        this.name = 'ApplyDrawError';
        this.product_info = product_info;
        this.size_info = size_info;
    }
}

module.exports.TaskInfoError = TaskInfoError;
module.exports.ProductInfoError = ProductInfoError;
module.exports.OpenProductPageError = OpenProductPageError;
module.exports.SizeInfoError = SizeInfoError;
module.exports.ApplyDrawError = ApplyDrawError;