const { app } = require('electron');
const path = require('path');
var package_json = require('./package.json');

const APP_DATA_PATH = path.join(app.getPath("appData"), package_json.name);

const USER_FILE_PATH = {
    USER_INFO :  path.join(APP_DATA_PATH, 'userdata', 'user_info.dat'),
    BILLING_INFO : path.join(APP_DATA_PATH, 'userdata', 'billing_info.dat'),
    PROXY_INFO : path.join(APP_DATA_PATH, 'userdata', 'proxy_info.dat'),
    SETTINGS_INFO : path.join(APP_DATA_PATH, 'userdata', 'settings.dat'),
    APP_AUTH_INFO : path.join(APP_DATA_PATH, 'userdata', 'aai.dat'),
    APP_UPDATE_INFO : path.join(APP_DATA_PATH, 'userdata', 'au.dat'),
    VIEW_TERM_INFO : path.join(APP_DATA_PATH, 'userdata', 'vt.dat'),
    NEW_RELEASED_PRODUCT_WHITELIST_INFO : path.join(APP_DATA_PATH, 'userdata', 'nr_wl.dat'),
    NEW_RELEASED_PRODUCT_BLACKLIST_INFO : path.join(APP_DATA_PATH, 'userdata', 'nr_bl.dat'),
    NEW_RELEASED_PRODUCT_CUSTOM_WATCH_PAGE_LIST_INFO : path.join(APP_DATA_PATH, 'userdata', 'nr_cwpl.dat'),
};

module.exports.USER_FILE_PATH = USER_FILE_PATH;
module.exports.APP_DATA_PATH = APP_DATA_PATH;