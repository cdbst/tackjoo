const {ipcRenderer} = require('electron');
ipcRenderer.on('message', on_message);

(()=>{
    document.addEventListener("DOMContentLoaded", function(){
        console.log('test');
    });
})();


function on_message(event, message) {
    window[message.api].apply(window, message.args);
}

window.test = function(args){
    console.log(args);
}

window.doLogin = function(id, pwd){
    document.getElementById('id').value = id;
    document.getElementById('pw').value = pwd;
    document.getElementById('loginBtn').click();
}

window.clickCheckoutBtn = function(){
    document.getElementById('btnPayment').click();
}