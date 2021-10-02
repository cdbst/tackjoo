
console.log('GEN Mouse Event');

var evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: 20,
    /* whatever properties you want to give it */
});

setInterval(()=>{
    bmak.hmd(evt);
}, 1000);


console.log('TEST END GEN Mouse Event');