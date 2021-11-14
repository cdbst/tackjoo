const path = require('path');

const USER_FILE_PATH = {
    USER_INFO :  path.join(__dirname, 'res', 'data', 'user_info.dat'),
    BILLING_INFO : path.join(__dirname, 'res', 'data', 'billing_info.dat'), 
};


module.exports.USER_FILE_PATH = USER_FILE_PATH;