

// Display the current version
let version = window.location.hash.substring(1);
console.log(version);

// Listen for messages
const {ipcRenderer} = require('electron');
ipcRenderer.on('message', function(event, text) {
    //var container = document.getElementById('messages');
    //var message = document.createElement('div');
    //message.innerHTML = text;
    console.log(event);
    console.log(text);
});