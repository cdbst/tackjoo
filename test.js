var evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: 20,
    /* whatever properties you want to give it */
});

var onClickGenSensorData = function(e){
    bmak.hmd(evt, (sensor_data)=>{
        //console.log(sensor_data);

        $.ajax({
            contentType: "application/json; charset=utf-8",
            url: '/sensor_data',
            type: 'POST',
            data: sensor_data,
            dataType: "json",
            success: function(data) {
                console.log('recv data');
            },
            error : function(data, textStatus, errorThrow) {
                console.log('err');
            }
        });
    });
}
