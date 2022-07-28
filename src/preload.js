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
    unsetToUpdate : _unsetToUpdate,
    startWatchingNewReleased : _startWatchingNewReleased,
    stopWatchingNewReleased : _stopWatchingNewReleased,
    notifyNewProduct : _notifyNewProduct,
    notifyNewProductList : _notifyNewProductList,
    registerchangeAppTab : _registerchangeAppTab,
    getKreamProductInfo : _getKreamProductInfo,
    loadOrderListInfo : _loadOrderListInfo,
    cancelOrder : _cancelOrder,
    saveNewProductWhiteListInfo : _saveNewProductWhiteListInfo,
    loadNewProductWhiteListInfo : _loadNewProductWhiteListInfo,
    saveNewProductBlackListInfo : _saveNewProductBlackListInfo,
    saveNewProductCustomWatchPageListInfo : _saveNewProductCustomWatchPageListInfo,
    loadNewProductBlackListInfo : _loadNewProductBlackListInfo,
    loadNewProductCustomWatchPageListInfo : _loadNewProductCustomWatchPageListInfo,
    cleanupCart : _cleanupCart,
    updateAccountInfo : _updateAccountInfo,
    saveAccountInfoList : _saveAccountInfoList,
    readTermFileData : _readTermFileData,
    updateViewTermSetting : _updateViewTermSetting,
    getViewTermSetting : _getViewTermSetting,
    exitProgram : _exitProgram,
    minimizeProgram : _minimizeProgram,
    maximizeProgram : _maximizeProgram,
    restoreSizeProgram : _restoreSizeProgram,
    setIgnoreMouseEvents : _setIgnoreMouseEvents,
    subscribeMaximizedEvent : _subscribeMaximizedEvent,
    unsubscribeMaximizedEvent : _unsubscribeMaximizedEvent,
    loadReturnableInfoList : _loadReturnableInfoList,
    requestReturnable : _requestReturnable,
    loadReturnedInfoList : _loadReturnedInfoList,
    cancelReturn : _cancelReturn,
    loadExclusiveInfo : _loadExclusiveInfo,
});

/**
 * 
 * Renderer process IPC Listenrs
 */

/** renderer process로부터 sensor data를 취득하기 위한 기능 */
let get_sensor_data = undefined;
function _register_get_sensor_data(_get_sensor_data){
    get_sensor_data = _get_sensor_data;
}
ipcRenderer.on('gen-sensor-data', (event, _data) => {

    get_sensor_data((_sensor_data) =>{

        let ipc_data = get_ipc_data({
            sensor_data : _sensor_data
        })

        ipcRenderer.send('gen-sensor-data-reply' + _data.id, ipc_data);
    });
});


/** renderer process의 app tab을 임의로 변경하기 위한 기능 */
let changeAppTab = undefined;
function _registerchangeAppTab(_changeAppTab){
    changeAppTab = _changeAppTab;
}
ipcRenderer.on('change-app-tab', (event, _data) => {
    if(changeAppTab)changeAppTab(_data.payload.tab_el_id);
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

function _addAccount(account_info, _save_to_file, __callback){

    let ipc_payload = {account_info : account_info, save_to_file : _save_to_file}
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

function _getProductInfo(_product_url, _loader_account_email, __callback){

    let ipc_data = get_ipc_data({
        product_url : _product_url,
        loader_account_email: _loader_account_email,
    });

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

        // if(_task_info._id in task_ipc_handler_map){
        //     ipcRenderer.removeListener('play-task-reply' + _task_info._id, task_ipc_handler_map[_task_info._id]);
        //     delete task_ipc_handler_map[_task_info._id];
        // }

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

function _loadOrderListInfo(__callback){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('load-order-info-list', ipc_data);

    ipcRenderer.once('load-order-info-list-reply' + ipc_data.id, (_event, order_info_list_info) => {
        __callback(order_info_list_info.err, order_info_list_info.data);
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

function _unsetToUpdate(){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('unset-to-update', ipc_data);
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
    const ipc_data = get_ipc_data({product_info : product_info});
    ipcRenderer.send('notify-new-product', ipc_data);
}

function _notifyNewProductList(product_info_list){
    const ipc_data = get_ipc_data({product_info_list : product_info_list});
    ipcRenderer.send('notify-new-product-list', ipc_data);
}

function _getKreamProductInfo(model_id, __callback){
    let ipc_data = get_ipc_data({model_id : model_id});
    ipcRenderer.send('get-kream-trade-price', ipc_data);

    ipcRenderer.once('get-kream-trade-price-reply' + ipc_data.id, (_event, kream_trade_price_info) => {
        __callback(kream_trade_price_info.err, kream_trade_price_info.data);
    });
}

function _cancelOrder(order_info, __callback){
    let ipc_data = get_ipc_data({order_info : order_info});
    ipcRenderer.send('cancel-order', ipc_data);

    ipcRenderer.once('cancel-order-reply' + ipc_data.id, (_event, result_info) => {
        __callback(result_info.err, result_info.data);
    });
}

function _saveNewProductWhiteListInfo(whitelist_info, __callback){

    if(whitelist_info == undefined || typeof whitelist_info !== 'object'){
        __callback('whitelist_info info to save is not valid data.', undefined);
        return;
    }

    let ipc_data = get_ipc_data({whitelist_info : whitelist_info});
    
    ipcRenderer.send('save-new-released-product-whitelist-info', ipc_data);

    ipcRenderer.once('save-new-released-product-whitelist-info-reply' + ipc_data.id, (_event, save_result) => {
        __callback(save_result.err);
    });
}

function _loadNewProductWhiteListInfo(__callback){

    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('load-new-released-product-whitelist-info', ipc_data);

    ipcRenderer.once('load-new-released-product-whitelist-info-reply' + ipc_data.id, (_event, whitelist_info) => {
        __callback(whitelist_info.err, whitelist_info.data);
    });
}

function _saveNewProductBlackListInfo(blacklist_info, __callback){

    if(blacklist_info == undefined || typeof blacklist_info !== 'object'){
        __callback('blacklist_info info to save is not valid data.', undefined);
        return;
    }

    let ipc_data = get_ipc_data({blacklist_info : blacklist_info});
    
    ipcRenderer.send('save-new-released-product-blacklist-info', ipc_data);

    ipcRenderer.once('save-new-released-product-blacklist-info-reply' + ipc_data.id, (_event, save_result) => {
        __callback(save_result.err);
    });
}

function _saveNewProductCustomWatchPageListInfo(custom_watch_page_list_info, __callback){
    if(custom_watch_page_list_info == undefined || typeof custom_watch_page_list_info !== 'object'){
        __callback('custom_watch_page_list_info info to save is not valid data.', undefined);
        return;
    }

    let ipc_data = get_ipc_data({custom_watch_page_list_info : custom_watch_page_list_info});
    
    ipcRenderer.send('save-new-released-product-custom-watch-page-list-info', ipc_data);

    ipcRenderer.once('save-new-released-product-custom-watch-page-list-info-reply' + ipc_data.id, (_event, save_result) => {
        __callback(save_result.err);
    });
}

function _loadNewProductBlackListInfo(__callback){

    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('load-new-released-product-blacklist-info', ipc_data);

    ipcRenderer.once('load-new-released-product-blacklist-info-reply' + ipc_data.id, (_event, blacklist_info) => {
        __callback(blacklist_info.err, blacklist_info.data);
    });
}

function _loadNewProductCustomWatchPageListInfo(__callback){
    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('load-new-released-custom-watch-page-list-info', ipc_data);

    ipcRenderer.once('load-new-released-custom-watch-page-list-info-reply' + ipc_data.id, (_event, custom_watch_page_list_info) => {
        __callback(custom_watch_page_list_info.err, custom_watch_page_list_info.data);
    });
}

function _cleanupCart(_id, __callback){

    if(_id == '' || _id == undefined){
        __callback('login fail : account unique id information is invalid');
        return;
    }

    let ipc_data = get_ipc_data({id : _id});

    ipcRenderer.send('cleanup-cart', ipc_data);

    ipcRenderer.once('cleanup-cart-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });
}

function _updateAccountInfo(account_id, account_info, __callback){
    const ipc_data = get_ipc_data({
        account_id : account_id,
        account_info : account_info
    });
    ipcRenderer.send('update-account-info', ipc_data);

    ipcRenderer.once('update-account-info-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });
}

function _saveAccountInfoList(account_info_list, __callback){

    const ipc_data = get_ipc_data({
        account_info_list : account_info_list
    });

    ipcRenderer.send('save-account-info-list', ipc_data);

    ipcRenderer.once('save-account-info-list-reply' + ipc_data.id, (event, err) => {
        __callback(err);
    });
}

function _readTermFileData(__callback){
    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('read-term-file', ipc_data);

    ipcRenderer.once('read-term-file-reply' + ipc_data.id, (_event, term_data_info) => {
        __callback(term_data_info.err, term_data_info.data);
    });
}

function _updateViewTermSetting(setting, __callback){

    const ipc_data = get_ipc_data({
        setting : setting
    });
    
    ipcRenderer.send('update-view-term-setting', ipc_data);

    ipcRenderer.once('update-view-term-setting-reply' + ipc_data.id, (_event, err) => {
        if(__callback)__callback(err);
    });
}

function _getViewTermSetting(__callback){

    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('read-view-term-setting', ipc_data);
    ipcRenderer.once('read-view-term-setting-reply' + ipc_data.id, (_event, data) => {
        __callback(data.err, data.data);
    });
}

function _exitProgram(){
    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('exit-program', ipc_data);
}

function _minimizeProgram(){
    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('minimize-program', ipc_data);
}

function _maximizeProgram(){
    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('maximize-program', ipc_data);
}

function _restoreSizeProgram(){
    let ipc_data = get_ipc_data();
    
    ipcRenderer.send('restore-maximize-program', ipc_data);
}

function _setIgnoreMouseEvents(setting){
    const ipc_data = get_ipc_data({
        setting : setting
    });
    
    ipcRenderer.send('set-ignore-mouse-events', ipc_data);
}


const maximized_event_subscriber = {};

ipcRenderer.on('on-maximized-event', (event, setting) => {
    for(const evt_cb of Object.values(maximized_event_subscriber)){
        evt_cb(setting);
    }
});

function _subscribeMaximizedEvent(subscriber_id, event_cb){
    maximized_event_subscriber[subscriber_id] = event_cb;
}

function _unsubscribeMaximizedEvent(subscriber_id){
    if(subscriber_id in maximized_event_subscriber) delete maximized_event_subscriber[subscriber_id];
}

function _loadReturnableInfoList(__callback){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('load-returnable-list', ipc_data);

    ipcRenderer.once('load-returnable-list-reply' + ipc_data.id, (_event, returnable_info_list_info) => {
        __callback(returnable_info_list_info.err, returnable_info_list_info.data);
    });
}

function _requestReturnable(returnable_info_list, submit_returnable_info, __callback){
    let ipc_data = get_ipc_data({
        returnable_info_list : returnable_info_list,
        submit_returnable_info : submit_returnable_info
    });
    ipcRenderer.send('request-returnable', ipc_data);

    const request_returnable_evt_handler = (_event, request_returnable_result) => {

        if(request_returnable_result.stop){
            ipcRenderer.removeListener('request-returnable-reply' + ipc_data.id, request_returnable_evt_handler);
            __callback(true, undefined);
        }else{
            __callback(false, request_returnable_result.data);
        }
    }

    ipcRenderer.on('request-returnable-reply' + ipc_data.id, request_returnable_evt_handler);
}

function _loadReturnedInfoList(__callback){
    let ipc_data = get_ipc_data();
    ipcRenderer.send('load-returned-info-list', ipc_data);

    ipcRenderer.once('load-returned-info-list-reply' + ipc_data.id, (_event, returned_info_list_info) => {
        __callback(returned_info_list_info.err, returned_info_list_info.data);
    });
}

function _cancelReturn(returned_info, __callback){
    let ipc_data = get_ipc_data({returned_info : returned_info});
    ipcRenderer.send('cancel-return', ipc_data);

    ipcRenderer.once('cancel-return-reply' + ipc_data.id, (_event, result_info) => {
        __callback(result_info.err, result_info.data);
    });
}

function _loadExclusiveInfo(exclusive_url, __callback){
    let ipc_data = get_ipc_data({
        exclusive_url : exclusive_url,
    });

    ipcRenderer.send('load-exclusive-info-list', ipc_data);

    ipcRenderer.once('load-exclusive-info-list-reply' + ipc_data.id, (_event, exclusive_info_list_info) => {
        __callback(exclusive_info_list_info.err, exclusive_info_list_info.data);
    });
}