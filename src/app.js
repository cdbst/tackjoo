const { app, BrowserWindow } = require("electron");
const log = require('electron-log');

const path = require("path");
const IpcM = require('./ipc/ipc_main');
const common = require('./common/common');
const app_cfg = require('./app_config');
const { autoUpdater } = require("electron-updater");
const package_json = require('./package.json');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = true;

app_cfg.set_log('info', false);

if (process.platform === 'win32'){
    app.setAppUserModelId(package_json.name);
}

function create_window() {
    try{
        const win = new BrowserWindow({
            width: 1620,
            height: 1040,
            minWidth : 1620,
            minHeight : 1040,
            webPreferences: {
                //devTools: false,
                //sandbox: true,
                nodeIntegration: true,
                preload: path.join(__dirname, "preload.js"),
                backgroundThrottling: false
            },
            //offscreen : true
        });

        app.main_browser_window = win;
        IpcM.register(win);
    
        win.webContents.openDevTools();
        win.setMenuBarVisibility(false);
        win.loadFile(path.join(__dirname, "index.html"));
    }catch(e){
        log.error(common.get_log_str('app.js', 'create_window', e));
    }
}

/**
 * 앱 업데이트 기능
 * 
 */
let update_win = undefined;

async function check_update(){
    try{
        const app_update_info_path = require('./user_file_path.js').USER_FILE_PATH.APP_UPDATE_INFO;
        const UserFileManager = require("./api/user_file_mngr.js").UserFileManager;
        const update_info = await UserFileManager.read(app_update_info_path);

        return update_info.update;

    }catch(error){
        log.error(common.get_log_str('app.js', 'check_update', error));
        return false;
    }
    
}

function send_message_to_update_win(message) {
    if(update_win === undefined) return;
    update_win.webContents.send('message', message);
}

function send_progess_to_update_win(progress_percent) {
    if(update_win === undefined) return;
    update_win.webContents.send('progress', progress_percent);
}

function create_update_window() {
    update_win = new BrowserWindow({
        width: 400,
        height: 500,
        minWidth : 400,
        minHeight : 500,
        titleBarStyle: "hidden",
        webPreferences: {
            devTools: false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        offscreen : true,
        resizable: false
    });
    //update_win.webContents.openDevTools();
    update_win.on('closed', () => {
        update_win = null;
    });
    update_win.loadURL(path.join(__dirname, "update.html"));
    return update_win;
}

autoUpdater.on('checking-for-update', () => {
    send_message_to_update_win('업데이트 확인 중..');
})
autoUpdater.on('update-available', (info) => {
    send_message_to_update_win(`새로운 버전이 확인됐습니다. -> ${info.version}`);
})
autoUpdater.on('update-not-available', (info) => {
    update_win.close();
    create_window();
})
autoUpdater.on('error', (err) => {
    log.error(common.get_log_str('app.js', 'autoUpdater-on-error', err));
    send_message_to_update_win('업데이트에 실패 했습니다. 수동 다운로드 : https://github.com/cdbst/sbkr_release/releases');
})
autoUpdater.on('download-progress', (progress_obj) => {
    let log_message = "다운로드 속도: " + progress_obj.bytesPerSecond;
    log_message = log_message + ' (' + progress_obj.transferred + "/" + progress_obj.total + ')';
    send_message_to_update_win(log_message);
    send_progess_to_update_win(progress_obj.percent);
})
autoUpdater.on('update-downloaded', (info) => {

    (async ()=>{
        try{
            const app_update_info_path = require('./user_file_path').USER_FILE_PATH.APP_UPDATE_INFO;
            const UserFileManager = require("./api/user_file_mngr.js").UserFileManager;
            await UserFileManager.write(app_update_info_path, { update : false });
        }catch(err){
            log.error(common.get_log_str('app.js', 'update-downloaded-callback', err));
        }finally{
            send_message_to_update_win('다운로드 완료. 다시 시작하는 중..');
            autoUpdater.quitAndInstall(false, true);
        }
    })();
});

app.whenReady().then(async () => {

    const start_update = await check_update();
    log.info(common.get_log_str('app.js', 'whenReady', '=======App start : ' + start_update));

    if(process.env.BUILD_ENV === 'develop'){
        create_window();
    }else{
        if(start_update){
            create_update_window();
            autoUpdater.checkForUpdatesAndNotify();
        }else{
            create_window();
        }
    }

    //for mac platform
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            if(process.env.BUILD_ENV === 'develop'){
                create_window();
            }else{
                if(start_update){
                    create_update_window();
                    autoUpdater.checkForUpdatesAndNotify();
                }else{
                    create_window();
                }
            }
        }
    });
});

app.on("window-all-closed", () => {
    log.info(common.get_log_str('app.js', 'window-all-closed-callback', '=======App close'));
    if (process.platform !== "darwin") {
        app.quit();
    }
});