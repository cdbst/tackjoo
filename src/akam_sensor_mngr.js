class MouseEventManager{

    constructor(){
        this.get_random_pointerX = this.get_random_pointerX.bind(this);
        this.get_random_pointerY = this.get_random_pointerY.bind(this);
        this.get_random_elemnet = this.get_random_elemnet.bind(this);
    }

    get_mouse_event(_element, _pointerX, _pointerY)
    {
        let pointerX = _pointerX == undefined ? this.get_random_pointerX() : _pointerX;
        let pointerY = _pointerY == undefined ? this.get_random_pointerY() : _pointerY;

        let options = {
            pointerX: pointerX,
            pointerY: pointerY,
            button: 0,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            bubbles: true,
            cancelable: true
        }
        
        let mouse_event = document.createEvent('MouseEvents');
        let element = _element == undefined ? this.get_random_elemnet() : _element
        
        mouse_event.initMouseEvent('click', options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        
        return mouse_event;
    }

    get_random_pointerX(){
        return Math.random() * (window.innerWidth - 0) + 0;
    }

    get_random_pointerY(){
        return Math.random() * (window.innerHeight - 0) + 0;
    }

    get_random_elemnet(){
        
        var els = document.body.getElementsByTagName('div');
        var index = Math.floor(Math.random() * (0 - els.length + 1)) + els.length;

        return els[index];
    }
}

const mouse_evt_mngr = new MouseEventManager();

function send_sensor_data_hooker(sensor_data){
    window.mainAPI.sendSensorData(sensor_data);
}

