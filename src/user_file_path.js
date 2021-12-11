const { app } = require('electron');
const path = require('path');
var package_json = require('./package.json');

const app_data_path = path.join(app.getPath("appData"), package_json.name);

const USER_FILE_PATH = {
    USER_INFO :  path.join(app_data_path, 'userdata', 'user_info.dat'),
    BILLING_INFO : path.join(app_data_path, 'userdata', 'billing_info.dat'),
    PROXY_INFO : path.join(app_data_path, 'userdata', 'proxy_info.dat'),
    SETTINGS_INFO : path.join(app_data_path, 'userdata', 'settings.dat')
};

module.exports.USER_FILE_PATH = USER_FILE_PATH;