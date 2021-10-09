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

//Below code are for test.
contextBridge.exposeInMainWorld('myAPI', {
    testAPI : _testAPI
});

function _testAPI(cb){

    ipcRenderer.send('asynchronous-message', 'ping')

    ipcRenderer.once('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
        cb('acbcc');
    })
}

