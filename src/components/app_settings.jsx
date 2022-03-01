class AppSettings{
    constructor(){

        this.saveAppSettings = this.saveAppSettings.bind(this);
        this.loadAppSettings = this.loadAppSettings.bind(this);
        this.updateSetting = this.updateSetting.bind(this);
        this.getSetting = this.getSetting.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.compareSettingsInfo = this.compareSettingsInfo.bind(this);

        this.settings_info = {
            http_req_ret_cnt : 30,
            http_req_ret_interval : 1.5,
            http_req_timeout : 0,
            http_max_req_within_same_ip : 3,
            task_ret_cnt : 0,
            task_ret_interval : 1,
            nike_login_session_timeout : 60, // 분 단위
            restock_watchdog_interval: 3,
            new_product_watch_interval: 1,
            new_product_watch_max_ret: 0,
            new_product_create_task_use_proxy : 0,
        }
    }

    updateSetting(property, value){
        this[property] = value;
    }

    getSetting(property){
        return this[property];
    }

    updateSettings(settings_info){
        Object.assign(this.settings_info, settings_info);
    }

    loadAppSettings(__callback){
        
        window.electron.loadSettingsInfo((error, settings_info) =>{
            if(error){
                __callback(error);
                return;
            }

            this.updateSettings(settings_info);
            __callback(undefined, this.settings_info);
        });
    }

    compareSettingsInfo(settings_info){
        return window.electron.compareJSON(settings_info, this.settings_info);
    }

    saveAppSettings(__callback){

        window.electron.saveSettingsInfo(this.settings_info, (error)=>{
            if(error){
                __callback(error);
                return;
            }

            __callback(undefined);
        });
    }
}