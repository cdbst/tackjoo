const {ipcRenderer} = require('electron');
ipcRenderer.on('message', on_message);

function on_message(event, message) {
    window[message.api].apply(window, message.args);
}

window.doLogin = function(id, pwd){
    document.getElementById('id').value = id;
    document.getElementById('pw').value = pwd;
    document.getElementById('loginBtn').click();
}

window.clickCheckoutBtn = function(){
    document.getElementById('btnPayment').click();
}

window.doCheckout = function(key_map_text, password){

    const key_dict = {};
    const key_lines = key_map_text.split('\n');

    for(var i = 0; i < key_lines.length; i++){
        const key_line = key_lines[i];

        for(var j = 0; j < key_line.length; j++){
            const key_val = key_line[j];
            key_dict[key_val] = 'A_' + ((i * 4) + j);
        }
    }

    for(var i = 0; i < password.length; i++){
        const key_el_id = key_dict[password[i]];
        document.getElementById('lazyModalDialogIframe').contentWindow.document.getElementById(key_el_id).click();
    }
}