const { contextBridge } = require('electron');
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type]);
    }
});

contextBridge.exposeInMainWorld('mainAPI', {
    sendSensorData : _sendSensorData,
    addAccount : _addAccount,
    removeAccount : _removeAccount,
    login : _login,
    getAccountInfo : _getAccountInfo
});


/**
 * 
 * Renderer process IPC Listenrs
 */

//TODO Below codes are for test.
ipcRenderer.on('req-sensor-data', (event, data) => {

    console.log('response req-sensor-data');

    ipcRenderer.send('req-sensor-data-reply', 'test');
});

/**
 * 
 * Custom APIs for IPCs (Process : Renderer process -> Main process -> Renderer process)
 */

function get_ipc_id() {

    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function get_ipc_data(_payload = undefined){

    _payload = _payload == undefined ? {} : _payload;

    return {
        payload : _payload,
        id : get_ipc_id()
    }
}

function _sendSensorData(sensor_data){
    ipcRenderer.send('send_sensor_data', sensor_data);
}

function _addAccount(_email, _pwd, _id, __callback){

    if(_email == '' || _email == undefined){
        __callback('add account fail : email information is invalid');
        return;
    }

    if(_pwd == '' || _pwd == undefined){
        __callback('add account fail : password information is invalid');
        return;
    }

    if(_id == '' || _id == undefined){
        __callback('add account fail : account unique id information is invalid');
        return;
    }

    let ipc_payload = {email : _email, pwd : _pwd, id : _id}
    let ipc_data = get_ipc_data(ipc_payload);

    ipcRenderer.send('add-account', ipc_data);

    ipcRenderer.once('add-account-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });
}

function _removeAccount(_id, __callback){
    if(_id == '' || _id == undefined){
        __callback('remove account fail : account unique id information is invalid');
        return;
    }

    let ipc_data = get_ipc_data({id : _id});

    ipcRenderer.send('remove-account', ipc_data);

    ipcRenderer.once('remove-account-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });

}

function _login(_id, __callback){

    if(_id == '' || _id == undefined){
        __callback('login fail : account unique id information is invalid');
        return;
    }

    let ipc_data = get_ipc_data({id : _id});

    ipcRenderer.send('login', ipc_data);

    ipcRenderer.once('login-reply' + ipc_data.id, (event, err) => {
        console.warn('test _login reply');
        __callback(err);
    });
}

function _getAccountInfo(__callback){

    let ipc_data = get_ipc_data()

    ipcRenderer.send('get-account-info', ipc_data);

    ipcRenderer.once('get-account-info-reply' + ipc_data.id, (event, account_info) => {
        __callback(account_info);
    });
}

