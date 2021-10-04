var evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: 20,
    /* whatever properties you want to give it */
});

// example -- hmd > cma > bpd >  pd > apicall_bm (click event call stack )

var onClickGenSensorData = function(e){

    var evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 20,
        /* whatever properties you want to give it */
    });


    bmak.hmd(evt, (sensor_data)=>{
        //console.log(sensor_data);

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
            console.log('post login recv data : ' + data);
        },
        error : function(data, textStatus, errorThrow) {
            console.log('post login err');
        }
    });
}

window.onload = function() {

    document.body.onclick=function(e) {

        var event=e || window.event;

        bmak.hmd(evt, (sensor_data)=>{

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

        //onClickLogin();
    };
};

