const {ipcRenderer} = require('electron');
ipcRenderer.on('message', on_message);

function on_message(event, message) {
    window[message.api].apply(window, message.args);
}

function get_element(id, __callback){
    const interval = setInterval((id)=>{
        const element = document.getElementById(id);
        if(element === null) return;
        clearInterval(interval);
        __callback(element)
    }, 100, id);
}

function get_element_by_class(class_name, __callback){
    const interval = setInterval((class_name)=>{
        const elements = document.getElementsByClassName(class_name);
        if(elements.length === 0) return;
        clearInterval(interval);
        __callback(elements)
    }, 100, class_name);
}

function get_iframe_child_element(iframe, id, __callback){
    const interval = setInterval((id)=>{
        const element = iframe.contentWindow.document.getElementById(id);
        if(element === null) return;
        clearInterval(interval);
        __callback(element)
    }, 100, id);
}

function get_iframe_child_class_elements(iframe, class_name, required_count, __callback){
    const interval = setInterval((class_name)=>{
        const elements = iframe.contentWindow.document.getElementsByClassName(class_name);
        if(elements.length !== required_count) return;
        clearInterval(interval);
        __callback(elements);
    }, 100, class_name);
}


function wating_for_checkout_card_loading(__callback){
    get_element_by_class('noPaymentMethod', (els_no_payment_div)=>{
        const interval = setInterval((el_no_payment_div)=>{
            if(el_no_payment_div.style.display !== 'none') return;
            clearInterval(interval);
            __callback();
        },100, els_no_payment_div[0])
    })
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

    get_element('id', (el_input_id)=>{
        el_input_id.value = id;

        get_element('pw', (el_input_pwd) =>{
            el_input_pwd.value = pwd;

            get_element('loginBtn', (el_btn_login) =>{
                el_btn_login.click();
            });
        });
    });
}

window.doConfirmBirthdayIfno = function(birthday){
    get_element('birthday', (el_birthday_input)=>{
        el_birthday_input.value = birthday;
        get_element('confirmBtn', (el_btn_confirm) =>{
            el_btn_confirm.click();
        });
    });
}

window.clickCheckoutBtn = function(){
    get_element('btnPayment', (payment_btn)=>{
        wating_for_checkout_card_loading(()=>{
            payment_btn.click();
        });
    });
}

window.doCheckout = function(key_map_text, password){

    //숫자가 아닌 것들을 모두 제거
    key_map_text = key_map_text.replace(/[^0-9]/g, '');

    if(key_map_text.length !== 10){ //이미지 인식 결과가 이상하다면 재시도.
        get_element_by_class('ly_close', (close_btns)=>{
            close_btns[0].click();
            window.clickCheckoutBtn();
        });
    }else{
        get_element('lazyModalDialogIframe', (iframe)=>{

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
        }); 
    }
}