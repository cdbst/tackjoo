var evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: 20,
    /* whatever properties you want to give it */
});

function get_random_elemnet(){
    // get all the elements from the body
    var elems = document.body.getElementsByTagName("div");

    // specify a random index
    var index = Math.floor(Math.random() * (0 - elems.length + 1)) + elems.length;

    // get the random element
    var randomElement = elems[index];

    return randomElement;
}

function simulate(element, options)
{
    var oEvent = document.createEvent('MouseEvents');
    
    
    oEvent.initMouseEvent('click', options.bubbles, options.cancelable, document.defaultView,
    options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
    
    return oEvent;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var defaultOptions = {
    pointerX: 500,
    pointerY: 600,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}

// example --> hmd > cma > bpd >  pd > apicall_bm > call below hook (example about click event call stack )
let send_sensor_data_hooker = function (sensor_data){
    let _sensor_data = JSON.parse(sensor_data)
    $('#sensor_data_monitor').val(_sensor_data.sensor_data);
    send_sensor_data_to_backend(sensor_data);
}

var onClickGenSensorData = function(e){

    let mouseEvent = simulate(get_random_elemnet(), defaultOptions);

    bmak.hmd(mouseEvent, (sensor_data)=>{
        

        $.ajax({
            contentType: "application/json; charset=utf-8",
            url: '/sensor_data',
            type: 'POST',
            data: sensor_data,
            dataType: "json",
            success: function(data) {
                //console.log('recv data');
            },
            error : function(data, textStatus, errorThrow) {
                //console.log('err');
            }
        });
    });
}

var onClickLogin = function(e){
    let _id = $('#input_id').val();
    let _pwd = $('#input_pwd').val();
    let _data = {
        id : _id,
        pwd : _pwd
    }
    _data = JSON.stringify(_data);

    $.ajax({
        contentType: "application/json; charset=utf-8",
        url: '/login',
        type: 'POST',
        data: _data,
        dataType: "json",
        success: function(data) {
            console.log(data);
        },
        error : function(data, textStatus, errorThrow) {
            console.log('post login err');
        }
    });
}

var onClickMyPage = function(e){

    $.ajax({
        contentType: "application/json; charset=utf-8",
        url: '/mypage',
        type: 'GET',
        success: function(data) {
            console.log(data);
        },
        error : function(data, textStatus, errorThrow) {
            console.log('post login err');
        }
    });
}

let send_sensor_data_to_backend = function(sensor_data){

    $.ajax({
        contentType: "application/json; charset=utf-8",
        url: '/sensor_data',
        type: 'POST',
        data: sensor_data,
        dataType: "json",
        success: function(data) {
            console.log(data);
        },
        error : function(data, textStatus, errorThrow) {
            //console.log('err');
        }
    });
}
