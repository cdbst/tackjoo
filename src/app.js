const { app, BrowserWindow } = require("electron");
const log = require('electron-log');

const path = require("path");
const IpcM = require('./ipc/ipc_main');
const common = require('./common/common');
const app_cfg = require('./app_config');
const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = true;

app_cfg.set_log('info', false);

function create_window() {
    try{
        const win = new BrowserWindow({
            width: 1620,
            height: 1020,
            minWidth : 1620,
            minHeight : 1020,
            webPreferences: {
                devTools: false,
                //sandbox: true,
                nodeIntegration: true,
                preload: path.join(__dirname, "preload.js"),
                backgroundThrottling: false
            },
            offscreen : true
        });

        app.main_browser_window = win;
    
        IpcM.register(win);
    
        //win.webContents.openDevTools();
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

function sendStatusToWindow(text) {
    log.info(text);
    update_win.webContents.send('message', text);
}
function create_update_window() {
    update_win = new BrowserWindow({
        width: 400,
        height: 500,
        minWidth : 400,
        minHeight : 500,
        titleBarStyle: "hidden",
        webPreferences: {
            //devTools: false,
            //sandbox: true,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        offscreen : true,
        //resizable: false
    });
    update_win.webContents.openDevTools();
    update_win.on('closed', () => {
        update_win = null;
    });
    update_win.loadURL(`file://${__dirname}/update.html#v${app.getVersion()}`);
    return update_win;
}
autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    //sendStatusToWindow('Update not available.');
    create_window();
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
});


//
// CHOOSE one of the following options for Auto updates
//

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------


app.whenReady().then(async () => {
    log.info(common.get_log_str('app.js', 'whenReady', '=======App start'));

    create_update_window();
    const test = await autoUpdater.checkForUpdatesAndNotify();
    //create_window();

    //for mac platform
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            create_update_window();
            //create_window();
        }
    });
});

app.on("window-all-closed", () => {
    log.info(common.get_log_str('app.js', 'window-all-closed-callback', '=======App close'));
    if (process.platform !== "darwin") {
        app.quit();
    }
});