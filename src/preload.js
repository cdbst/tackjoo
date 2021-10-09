const { contextBridge } = require('electron');
const { ipcRenderer } = require('electron')

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
    login : _login
});

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

    ipcRenderer.send('add-account', {email : _email, pwd : _pwd, id : _id});

    ipcRenderer.once('add-account-reply', (event, err) => {
        __callback(err);
    });
}

function _removeAccount(_id, __callback){
    if(_id == '' || _id == undefined){
        __callback('remove account fail : account unique id information is invalid');
        return;
    }

    ipcRenderer.send('remove-account', _id);

    ipcRenderer.once('remove-account-reply', (event, err) => {
        __callback(err);
    });

}

function _login(_id, __callback){

    if(_id == '' || _id == undefined){
        __callback('login fail : account unique id information is invalid');
        return;
    }

    ipcRenderer.send('login', _id);

    ipcRenderer.once('login-reply', (event, err) => {
        __callback(err);
    });
}

