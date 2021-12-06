const path = require('path');

const USER_FILE_PATH = {
    USER_INFO :  path.join(__dirname, 'res', 'data', 'user_info.dat'),
    BILLING_INFO : path.join(__dirname, 'res', 'data', 'billing_info.dat'),
    PROXY_INFO : path.join(__dirname, 'res', 'data', 'proxy_info.dat'),
    SETTINGS_INFO : path.join(__dirname, 'res', 'data', 'settings.dat')
};

module.exports.USER_FILE_PATH = USER_FILE_PATH;