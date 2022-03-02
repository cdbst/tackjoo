const { contextBridge } = require('electron');
const { ipcRenderer } = require('electron');
const { get_ipc_data } = require('./ipc/ipc_util');
const jsonDiff = require('json-diff');

contextBridge.exposeInMainWorld('electron', {
    sendSensorData : _sendSensorData,
    addAccount : _addAccount,
    addAccountList : _addAccountList,
    removeAccount : _removeAccount,
    login : _login,
    getAccountInfo : _getAccountInfo,
    register_get_sensor_data : _register_get_sensor_data,
    getProductInfoList : _getProductInfoList,
    getProductInfo : _getProductInfo,
    getLoggedInAccountInfoList : _getLoggedInAccountInfoList,
    playTask: _playTask,
    pauseTask: _pauseTask,
    searchAddr: _searchAddr,
    saveBillingInfo: _saveBillingInfo,
    loadBillingInfo: _loadBillingInfo,
    saveProxyInfo : _saveProxyInfo,
    loadProxyInfo : _loadProxyInfo,
    saveSettingsInfo : _saveSettingsInfo,
    loadSettingsInfo : _loadSettingsInfo,
    loadTheDrawItemList : _loadTheDrawItemList,
    openExternalWebPage : _openExternalWebPage,
    writeTextToClipboard : _writeTextToClipboard,
    getAccountIDbyEmail : _getAccountIDbyEmail,
    compareJSON : _compareJSON,
    loginApp : _loginApp,
    loadLoginInfo : _loadLoginInfo,
    deleteLoginInfo : _deleteLoginInfo,
    getAppVersion : _getAppVersion,
    openDirectory : _openDirectory,
    getAppPath : _getAppPath,
    restartToUpdate : _restartToUpdate,
    startWatchingNewReleased : _startWatchingNewReleased,
    stopWatchingNewReleased : _stopWatchingNewReleased,
    notifyNewProduct : _notifyNewProduct
});

let get_sensor_data = undefined;
function _register_get_sensor_data(_get_sensor_data){
    get_sensor_data = _get_sensor_data;
}

/**
 * 
 * Renderer process IPC Listenrs
 */

ipcRenderer.on('gen-sensor-data', (event, _data) => {

    get_sensor_data((_sensor_data) =>{

        let ipc_data = get_ipc_data({
            sensor_data : _sensor_data
        })

        ipcRenderer.send('gen-sensor-data-reply' + _data.id, ipc_data);
    });
});

/**
 * 
 * Custom APIs for IPCs (Process : Renderer process -> Main process -> Renderer process)
 */

function _sendSensorData(_sensor_data){

    let data = get_ipc_data({
        sensor_data : _sensor_data
    });

    ipcRenderer.send('send_sensor_data', data);
}

function _addAccount(_email, _pwd, _id, _save_to_file, __callback){

    if(_email == '' || _email == undefined){
        __callback('add account fail : email information is invalid');
        return;
    }

    if(_pwd == '' || _pwd == undefined){
        __callback('add account fail : password information is invalid');
        return;
    }

    if(_id == '' || _id == undefined){
        __callback('add account fail : account unique id information is invalid');
        return;
    }

    let ipc_payload = {email : _email, pwd : _pwd, id : _id, save_to_file : _save_to_file}
    let ipc_data = get_ipc_data(ipc_payload);

    ipcRenderer.send('add-account', ipc_data);

    ipcRenderer.once('add-account-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });
}

function _addAccountList(account_info_list, __callback){
    if(account_info_list.length === 0){
        __callback('add account list fail : account info list is empty.');
        return;
    }

    let ipc_data = get_ipc_data(account_info_list);

    ipcRenderer.send('add-account-list', ipc_data);

    ipcRenderer.once('add-account-list-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });
}

function _removeAccount(_id, __callback){
    if(_id == '' || _id == undefined){
        __callback('remove account fail : account unique id information is invalid');
        return;
    }

    let ipc_data = get_ipc_data({id : _id});

    ipcRenderer.send('remove-account', ipc_data);

    ipcRenderer.once('remove-account-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });

}

function _login(_id, __callback){

    if(_id == '' || _id == undefined){
        __callback('login fail : account unique id information is invalid');
        return;
    }

    let ipc_data = get_ipc_data({id : _id});

    ipcRenderer.send('login', ipc_data);

    ipcRenderer.once('login-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });
}

function _getAccountInfo(__callback){

    let ipc_data = get_ipc_data()

    ipcRenderer.send('get-account-info', ipc_data);

    ipcRenderer.once('get-account-info-reply' + ipc_data.id, (event, account_info) => {
        __callback(account_info.err, account_info.data);
    });
}

function _getProductInfoList(__callback){

    let ipc_data = get_ipc_data();

    ipcRenderer.send('get-product-info-list', ipc_data);

    ipcRenderer.once('get-product-info-list-reply' + ipc_data.id, (event, product_list) => {
        __callback(product_list.err, product_list.data);
    });
}

function _getProductInfo(_product_url, __callback){

    let ipc_data = get_ipc_data({product_url : _product_url});

    ipcRenderer.send('get-product-info', ipc_data);

    ipcRenderer.once('get-product-info-reply' + ipc_data.id, (event, product_info) => {
        __callback(product_info.err, product_info.data);
    });
}

function _getLoggedInAccountInfoList(__callback){

    let ipc_data = get_ipc_data();

    ipcRenderer.send('get-logged-in-account-info-list', ipc_data);

    ipcRenderer.once('get-logged-in-account-info-list-reply' + ipc_data.id, (event, logged_in_account_info_list) => {
        __callback(logged_in_account_info_list.err, logged_in_account_info_list.data);
    });
}

const task_ipc_handler_map = {};

function _playTask(_task_info, _product_info, _billing_info, _settings_info, __callback){
    
    let ipc_data = get_ipc_data({task_info : _task_info, product_info : _product_info, billing_info : _billing_info, settings_info : _settings_info});

    let task_evt_handler = (_event, data) => {

        if(data.done == true){
            if(_task_info._id in task_ipc_handler_map){
                ipcRenderer.removeListener('play-task-reply' + _task_info._id, task_ipc_handler_map[_task_info._id]);
                delete task_ipc_handler_map[_task_info._id];
            }
        }

        __callback(data.status, data.size_info);
    };

    task_ipc_handler_map[_task_info._id] = task_evt_handler;

    ipcRenderer.send('play-task', ipc_data);
    ipcRenderer.on('play-task-reply' + _task_info._id, task_ipc_handler_map[_task_info._id]);
}

function _pauseTask(_task_info, __callback){

    let ipc_data = get_ipc_data({task_info : _task_info});
    
    ipcRenderer.send('pause-task', ipc_data);

    ipcRenderer.once('pause-task-reply' + _task_info._id, (_event, data) => {

        if(_task_info._id in task_ipc_handler_map){
            ipcRenderer.removeListener('play-task-reply' + _task_info._id, task_ipc_handler_map[_task_info._id]);
            delete task_ipc_handler_map[_task_info._id];
        }

        __callback(data.err);
    });
}

function _searchAddr(_addr, __callback){

    if(_addr == undefined || _addr == ''){
        __callback('address to search is not set.', undefined);
        return;
    }

    let ipc_data = get_ipc_data({address : _addr});
    
    ipcRenderer.send('search-address', ipc_data);

    ipcRenderer.once('search-address-reply' + ipc_data.id, (_event, addr_search_result) => {
        __callback(addr_search_result.err, addr_search_result.data);
    });
}

function _saveBillingInfo(_billing_info, __callback){

    if(_billing_info == undefined || typeof _billing_info !== 'object'){
        __callback('billing info to save is not valid data.', undefined);
        return;
    }

    let ipc_data = get_ipc_data({billing_info : _billing_info});
    
    ipcRenderer.send('save-billing-info', ipc_data);

    ipcRenderer.once('save-billing-info-reply' + ipc_data.id, (_event, save_result) => {
        __callback(save_result.err);
    });
}

function _loadBillingInfo(__callback){

    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('load-billing-info', ipc_data);

    ipcRenderer.once('load-billing-info-reply' + ipc_data.id, (_event, billing_info) => {
        __callback(billing_info.err, billing_info.data);
    });
}

function _saveProxyInfo(proxy_info, __callback){

    if(proxy_info == undefined || typeof proxy_info !== 'object'){
        __callback('proxy info to save is not valid data.', undefined);
        return;
    }

    let ipc_data = get_ipc_data({proxy_info : proxy_info});
    ipcRenderer.send('save-proxy-info', ipc_data);

    ipcRenderer.once('save-proxy-info-reply' + ipc_data.id, (_event, save_result) => {
        __callback(save_result.err);
    });
}

function _loadProxyInfo(__callback){

    let ipc_data = get_ipc_data();
    ipcRenderer.send('load-proxy-info', ipc_data);

    ipcRenderer.once('load-proxy-info-reply' + ipc_data.id, (_event, proxy_info) => {
        __callback(proxy_info.err, proxy_info.data);
    });
}

function _saveSettingsInfo(settings_info, __callback){

    if(settings_info == undefined || typeof settings_info !== 'object'){
        __callback('proxy info to save is not valid data.', undefined);
        return;
    }

    let ipc_data = get_ipc_data({settings_info : settings_info});
    ipcRenderer.send('save-settings-info', ipc_data);

    ipcRenderer.once('save-settings-info-reply' + ipc_data.id, (_event, save_result) => {
        __callback(save_result.err);
    });
}

function _loadSettingsInfo(__callback){

    let ipc_data = get_ipc_data();
    ipcRenderer.send('load-settings-info', ipc_data);

    ipcRenderer.once('load-settings-info-reply' + ipc_data.id, (_event, settings_info) => {
        __callback(settings_info.err, settings_info.data);
    });
}

function _loadTheDrawItemList(__callback){

    let ipc_data = get_ipc_data();
    ipcRenderer.send('load-thedraw-item-list', ipc_data);

    ipcRenderer.once('load-thedraw-item-list-reply' + ipc_data.id, (_event, thedraw_item_list_info) => {
        __callback(thedraw_item_list_info.err, thedraw_item_list_info.data);
    });
}

function _openExternalWebPage(url){
    let ipc_data = get_ipc_data({url : url});
    ipcRenderer.send('open-external-webpage', ipc_data);
}

function _writeTextToClipboard(text){
    let ipc_data = get_ipc_data({text : text});
    ipcRenderer.send('write-text-to-clipboard', ipc_data);
}

function _getAccountIDbyEmail(email, __callback){
    let ipc_data = get_ipc_data({email : email});
    ipcRenderer.send('get-account-id-by-email', ipc_data);

    ipcRenderer.once('get-account-id-by-email-reply' + ipc_data.id, (_event, account_id_info) => {
        __callback(account_id_info.err, account_id_info.data);
    });
}

function _compareJSON(obj1, obj2){
    return jsonDiff.diff(obj1, obj2) == undefined ? true : false;
}

function _loginApp(email, password, remember, __callback){
    if(email === undefined || password === undefined || remember === undefined ||
        email === '' || password === '' || remember === ''){
            __callback('입력한 계정 정보가 올바르지 않습니다.', undefined);
            return;
    }

    let ipc_data = get_ipc_data({email : email, password : password, remember : remember});

    ipcRenderer.send('login-app', ipc_data);

    ipcRenderer.once('login-app-reply' + ipc_data.id, (_event, result) => {
        __callback(result.err, result.data);
    });
}

function _loadLoginInfo(__callback){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('load-login-info', ipc_data);

    ipcRenderer.once('load-login-info-reply' + ipc_data.id, (_event, login_info_data) => {
        __callback(login_info_data.err, login_info_data.data);
    });
}

function _deleteLoginInfo(__callback){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('delete-login-info', ipc_data);

    ipcRenderer.once('delete-login-info-reply' + ipc_data.id, (_event, result_info) => {
        __callback(result_info.err);
    });
}

function _getAppVersion(){
    const package_json = require('./package.json');
    return package_json.version;
}

function _openDirectory(path){
    let ipc_data = get_ipc_data({path : path});
    ipcRenderer.send('open-log-directory', ipc_data);
}

function _getAppPath(__callback){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('get-app-path', ipc_data);

    ipcRenderer.once('get-app-path-reply' + ipc_data.id, (_event, app_path) => {
        __callback(app_path);
    });
}

function _restartToUpdate(){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('restart-to-update', ipc_data);
}

function _startWatchingNewReleased(settings_info, __callback){
    let ipc_data = get_ipc_data({settings_info : settings_info});
    ipcRenderer.send('start-watching-new-released', ipc_data);

    const watch_evt_handler = (_event, {stop, product_info_list}) => {

        if(stop){
            ipcRenderer.removeListener('start-watching-new-released-reply' + ipc_data.id, watch_evt_handler);
            __callback(true, undefined);
        }else{
            __callback(false, product_info_list);
        }
    }

    ipcRenderer.on('start-watching-new-released-reply' + ipc_data.id, watch_evt_handler);
}

function _stopWatchingNewReleased(){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('stop-watching-new-released', ipc_data);
}

function _notifyNewProduct(product_info){
    let ipc_data = get_ipc_data({product_info : product_info});
    ipcRenderer.send('notify-new-product', ipc_data);
}