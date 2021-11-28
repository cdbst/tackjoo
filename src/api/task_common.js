
const TASK_MSG_TYPE = {
    API_CALL : 1,
    MESSAGE : 2,
    API_CALL_RES : 3,
    SYNC_BROWSER_CONTEXT : 4,
}

module.exports.gen_api_call_payload = (id, func, params) =>{
    return {
        type : TASK_MSG_TYPE.API_CALL,
        id : id,
        func : func,
        params : params
    }
}

module.exports.gen_message_payload = (message) =>{
    return {
        type : TASK_MSG_TYPE.MESSAGE,
        message : message
    }
}

module.exports.gen_api_call_res_payload = (id, err, data) =>{
    return {
        type : TASK_MSG_TYPE.API_CALL_RES,
        id : id,
        err : err,
        data : data
    }
}

module.exports.gen_browser_context_sync_payload = (browser_context) =>{
    return {
        type : TASK_MSG_TYPE.SYNC_BROWSER_CONTEXT,
        browser_context : JSON.stringify(browser_context)
        
    }
}

module.exports.TASK_MSG_TYPE = TASK_MSG_TYPE;