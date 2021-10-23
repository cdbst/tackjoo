const common = require('./common/common.js');

/**
 * 
 * Custom APIs for IPCs (Process : Renderer process -> Main process -> Renderer process)
 */

function get_ipc_data(_payload = undefined){

    _payload = _payload == undefined ? {} : _payload;

    return {
        payload : _payload,
        id : common.uuidv4()
    }
}

module.exports.get_ipc_data = get_ipc_data;