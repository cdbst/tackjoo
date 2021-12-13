const log = require('electron-log');
const common = require('./common/common');
const path = require('path');

module.exports.set_log = (log_lev_file, log_lev_console, log_path = undefined) =>{
    
    if(log_path == undefined){
        const APP_DATA_PATH = require('./user_file_path').APP_DATA_PATH;
        const cur_date = common.get_formatted_date_str(new Date());
        log_path = path.join(APP_DATA_PATH, 'logs', (cur_date + '.log'));
    }
    
    log.transports.file.resolvePath = () => log_path;
    log.transports.file.level = log_lev_file;
    log.transports.console.level = log_lev_console;
}