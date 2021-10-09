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
    sendSensorData : _sendSensorData
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

