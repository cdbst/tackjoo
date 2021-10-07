/**
 * util codes for view (frontend)
 */


function trigger_evnet(element, event_name){

    var event = new CustomEvent(event_name);
    element.dispatchEvent(event);
}