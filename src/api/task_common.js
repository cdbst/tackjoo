
const TASK_MSG_TYPE = {
    API_CALL : 1,
    API_CALL_RES : 2
}

module.exports.gen_api_call_payload = (id, func, params) =>{
    return {
        type : TASK_MSG_TYPE.API_CALL,
        id : id,
        func : func,
        params : params
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

module.exports.TASK_MSG_TYPE = TASK_MSG_TYPE;