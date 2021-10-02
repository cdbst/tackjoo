var evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: 20,
    /* whatever properties you want to give it */
});

var onClickGenSensorData = function(e){
    bmak.hmd(evt, (sensor_data)=>{
        console.log(sensor_data);
    });
}

