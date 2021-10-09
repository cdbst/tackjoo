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
    testAPI : _testAPI,
    sendSensorData : _sendSensorData,
    login : _login
});

//API IPC Wrappers
function _testAPI(cb){

    ipcRenderer.send('asynchronous-message', 'ping')

    ipcRenderer.once('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
        cb('acbcc');
    })
}

function _sendSensorData(sensor_data){
    ipcRenderer.send('send_sensor_data', sensor_data);
}

function _login(_email, _pwd, _id, __callback){

    if(_email == '' || _email == undefined){
        __callback('login fail : email information is invalid');
        return;
    }

    if(_pwd == '' || _pwd == undefined){
        __callback('login fail : password information is invalid');
        return;
    }

    if(_id == '' || _id == undefined){
        __callback('login fail : account unique id information is invalid');
        return;
    }

    ipcRenderer.send('login', {email : _email, pwd : _pwd, id : _id});

    ipcRenderer.once('login-reply', (event, err) => {
        __callback(err);
    });
}

