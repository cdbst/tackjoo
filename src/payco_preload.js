const { ipcRenderer } = require('electron');
ipcRenderer.on('message', on_message);

function on_message(event, message) {
    window[message.api].apply(window, message.args);
}

function get_element(id){

    return new Promise((resolve, reject) =>{

        let h_interval = undefined;

        try{
            h_interval = setInterval(()=>{
                const element = document.getElementById(id);
                if(element === null) return;
                if(h_interval) clearInterval(h_interval); // is async or sync???
                h_interval = undefined;
                resolve(element);
            }, 100);

        }catch(err){
            if(h_interval) clearInterval(h_interval);
            reject(err);
        }
    });
}

function wait_for_element_destroy(id){

    return new Promise((resolve, reject) =>{

        let h_interval = undefined;

        try{
            h_interval = setInterval(()=>{
                const element = document.getElementById(id);
                if(element !== null) return;
                if(h_interval) clearInterval(h_interval); // is async or sync???
                h_interval = undefined;
                resolve();
            }, 100);
        }catch(err){
            if(h_interval) clearInterval(h_interval);
            reject(err);
        }
    });
}

function get_element_by_class(class_name){

    return new Promise((resolve, reject) =>{

        let h_interval = undefined;

        try{
            h_interval = setInterval(()=>{
                const elements = document.getElementsByClassName(class_name);
                if(elements.length === 0) return;
                if(h_interval) clearInterval(h_interval);
                h_interval = undefined;
                resolve(elements)
            }, 100);
        }catch(err){
            if(h_interval) clearInterval(h_interval);
            reject(err);
        }
    });
}

function get_iframe_child_element(iframe, id){

    return new Promise((resolve, reject) =>{
        let h_interval = undefined;
        try{
            h_interval = setInterval(()=>{
                if(iframe.contentWindow == undefined || iframe.contentWindow.document == undefined){
                    return;
                }
                const element = iframe.contentWindow.document.getElementById(id);
                if(element === null) return;
                if(h_interval) clearInterval(h_interval);
                h_interval = undefined;
                resolve(element)
            }, 100);
        }catch(err){
            if(h_interval) clearInterval(h_interval);
            reject(err);
        }
    });
}

function get_iframe_child_class_elements(iframe, class_name, required_count){

    return new Promise((resolve, reject) =>{

        let h_interval = undefined;

        try{
            h_interval = setInterval(()=>{
                if(iframe.contentWindow == undefined || iframe.contentWindow.document == undefined){
                    return;
                }
                const elements = iframe.contentWindow.document.getElementsByClassName(class_name);
                if(elements.length !== required_count) return;
                if(h_interval) clearInterval(h_interval);
                h_interval = undefined;
                resolve(elements);
            }, 100);
        }catch(err){
            if(h_interval) clearInterval(h_interval);
            reject(err);
        }
    });
}


function wating_for_checkout_card_loading(){

    return new Promise((resolve, reject) =>{

        get_element_by_class('noPaymentMethod').then((els_no_payment_div)=>{

            let h_interval = undefined;
            const el_no_payment_div =  els_no_payment_div[0];

            try{
                h_interval = setInterval(()=>{
                    if(el_no_payment_div.style.display !== 'none') return;
                    if(h_interval) clearInterval(h_interval);
                    h_interval = undefined;
                    resolve();
                }, 100);
            }catch(err){
                if(h_interval) clearInterval(h_interval);
                reject(err);
            }

        }).catch((err)=>{
            reject(err);
        });
    });
}

function get_key_dict_from_virtual_keyborad_iframe(key_map_text, vkeyboard_iframe){

    const key_dict = {};
    let key_map_text_idx = 0;

    for(var i = 0; i < 11; i++){
        const el_key = vkeyboard_iframe.contentWindow.document.getElementById('A_' + i);
        if(el_key == null) continue;
        key_dict[key_map_text[key_map_text_idx++]] = i;
    }

    return key_dict;
}

function confirm_password(password, key_dict, pwd_enc_obj){

    pwd_enc_obj.gPassword.empty();

    password.split('').forEach((key)=> {
        pwd_enc_obj.gPassword.push(key_dict[key]);
    });
    
    console.log(pwd_enc_obj.gPassword);
    pwd_enc_obj.moveNext();
}

window.doLogin = function(id, pwd){

    get_element('id').then((el_input_id)=>{
        el_input_id.value = id;
        return get_element('pw');
    }).then((el_input_pwd)=>{
        el_input_pwd.value = pwd;
        return get_element('loginBtn');
    }).then((el_btn_login)=>{
        return el_btn_login.click();
    }).catch((err)=>{
        console.error(err);
    });
}

window.doConfirmBirthdayIfno = function(birthday){

    get_element('birthday').then((el_birthday_input)=>{
        el_birthday_input.value = birthday;
        return get_element('confirmBtn');
    }).then((el_btn_confirm)=>{
        el_btn_confirm.click();
    }).catch((err)=>{
        console.error(err);
    });
}

window.clickCheckoutBtn = function(){

    let _el_payment_btn = undefined;

    wait_for_element_destroy('lazyModalDialogIframe').then(()=>{
        return get_element('btnPayment');
    }).then((el_payment_btn)=>{
        _el_payment_btn = el_payment_btn;
        return wating_for_checkout_card_loading();
    }).then(()=>{
        _el_payment_btn.click();
    }).catch((err)=>{
        console.error(err);
    });
}

window.doCheckout = function(key_map_text, password){

    //숫자가 아닌 것들을 모두 제거
    key_map_text = key_map_text.replace(/[^0-9]/g, '');
    const unique_key_map_text = [...new Set(key_map_text)].join('');

    if(key_map_text.length !== 10 || key_map_text.length !== unique_key_map_text.length){ //이미지 인식 결과가 이상하다면 재시도.

        get_element_by_class('ly_close').then((close_btns)=>{
            close_btns[0].click();
            return wait_for_element_destroy('lazyModalDialogIframe');
        }).then(()=>{
            window.clickCheckoutBtn();
        }).catch((err)=>{
            console.error(err);
        });

        return;
    }

    let _el_iframe = undefined;

    get_element('lazyModalDialogIframe').then((iframe)=>{
        _el_iframe = iframe;
        return get_iframe_child_element(_el_iframe, 'ico_password1');
    }).then((_el_ico_pwd1)=>{
        return get_iframe_child_class_elements(_el_iframe, 'key', 13);
    }).then((_el_keys)=>{

        const key_dict = get_key_dict_from_virtual_keyborad_iframe(key_map_text, _el_iframe);
        const iframe_context = globalThis[4];        
        confirm_password(password, key_dict, iframe_context.pc.payment.password.enc);
        
    }).catch((err) =>{
        console.error(err);
    });
}