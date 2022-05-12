const { ipcRenderer } = require('electron');
const { reject } = require('lodash');
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
                clearInterval(h_interval); // is async or sync???
                h_interval = undefined;
                resolve(element);
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
                clearInterval(h_interval);
                resolve(elements)
            }, 100);
        }catch(err){
            if(h_interval) clearInterval(h_interval);
            reject(err);
        }
    });
}

function get_iframe_child_element(iframe, id, __callback){
    const interval = setInterval((id)=>{
        if(iframe.contentWindow == undefined || iframe.contentWindow.document == undefined){
            clearInterval(interval);
            return
        }
        const element = iframe.contentWindow.document.getElementById(id);
        if(element === null) return;
        clearInterval(interval);
        __callback(element)
    }, 100, id);
}

function get_iframe_child_class_elements(iframe, class_name, required_count, __callback){
    const interval = setInterval((class_name)=>{
        if(iframe.contentWindow == undefined || iframe.contentWindow.document == undefined){
            clearInterval(interval);
            return
        }
        const elements = iframe.contentWindow.document.getElementsByClassName(class_name);
        if(elements.length !== required_count) return;
        clearInterval(interval);
        __callback(elements);
    }, 100, class_name);
}


function wating_for_checkout_card_loading(payment_btn){

    return new Promise((resolve, reject) =>{

        get_element_by_class('noPaymentMethod').then((els_no_payment_div)=>{

            let h_interval = undefined;
            const el_no_payment_div =  els_no_payment_div[0];

            try{
                h_interval = setInterval(()=>{
                    if(el_no_payment_div.style.display !== 'none') return;
                    clearInterval(h_interval);
                    resolve(payment_btn);
                }, 100);
            }catch(err){
                reject(err);
            }

        }).catch((err)=>{
            if(h_interval) clearInterval(h_interval);
            reject(err);
        });
    });

    
}

function click_password_sequently(iframe, el_keys, password, key_dict){

    const _password = password.split('');
    let click_count = 0;

    const click_evt_listener = (e) =>{

        const key = _password.shift();
        if(key === undefined) return;
        const key_el_id = key_dict[key];
        const el_btn_key = iframe.contentWindow.document.getElementById(key_el_id);

        get_iframe_child_class_elements(iframe, 'ico on', click_count, (_el_pw_on_ico) =>{
            click_count++;
            event_fire(el_btn_key, 'click');
        });
    }
        
    for (var i = 0; i < el_keys.length; i++) {
        el_keys[i].removeEventListener('click', click_evt_listener, false);
        el_keys[i].addEventListener('click', click_evt_listener, false);
    }

    click_evt_listener();
}

function event_fire(el, etype){
    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
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

    get_element('btnPayment').then((payment_btn)=>{
        return wating_for_checkout_card_loading(payment_btn);
    }).then((payment_btn)=>{
        payment_btn.click();
    }).catch((err)=>{
        console.error(err);
    });
}

window.doCheckout = function(key_map_text, password){

    //숫자가 아닌 것들을 모두 제거
    key_map_text = key_map_text.replace(/[^0-9]/g, '');
    const unique_key_map_text = [...new Set(key_map_text)].join('');

    if(key_map_text.length !== 10 || key_map_text.length !== unique_key_map_text.length){ //이미지 인식 결과가 이상하다면 재시도.

        get_element_by_class('ly_close', (close_btns)=>{
            close_btns[0].click();
            window.clickCheckoutBtn();
        });
        return;
    }

    get_element('lazyModalDialogIframe').then((iframe)=>{

        get_iframe_child_element(iframe, 'ico_password1', ()=>{

            get_iframe_child_class_elements(iframe, 'key', 13, (el_keys) =>{
    
                const key_dict = {};
                let key_map_text_idx = 0;
    
                for(var i = 0; i < 11; i++){
                    const el_key = iframe.contentWindow.document.getElementById('A_' + i);
                    if(el_key == null) continue;
                    key_dict[key_map_text[key_map_text_idx++]] = ('A_' + i);
                }

                click_password_sequently(iframe, el_keys, password, key_dict);
            });
        });
    }).catch(err =>{

    });
}