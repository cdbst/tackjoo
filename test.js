
console.log('GEN Mouse Event');

var evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: 20,
    /* whatever properties you want to give it */
});

// setInterval(()=>{
//     bmak.hmd(evt, (sensor_data)=>{
//         console.log(sensor_data);
//     });
// }, 1000);


var onClickGenSensorData = function(e){
    console.log('trigger event!!');
    bmak.hmd(evt, (sensor_data)=>{
        console.log(sensor_data);
    });
}

console.log('TEST END GEN Mouse Event');