

let el_update_message = undefined;
let el_update_progress_bar = undefined;

document.addEventListener("DOMContentLoaded", function(){
    el_update_message = document.getElementById('update_message');
    el_update_progress_bar = document.getElementById('update-progress-bar');
});

const {ipcRenderer} = require('electron');
ipcRenderer.on('message', update_message);
ipcRenderer.on('progress', update_progress_bar);

function update_message(event, message) {
    if(el_update_message === undefined) return;
    el_update_message.innerText = message;
}

function update_progress_bar(event, progress) {
    if(el_update_progress_bar === undefined) return;
    const progress_value = Math.floor(progress);
    el_update_progress_bar.style.width = progress_value + '%';
    el_update_progress_bar.innerText = progress_value + '%';
    el_update_progress_bar.setAttribute('aria-valuenow', progress_value);
}