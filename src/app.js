const { app, BrowserWindow } = require("electron");
const log = require('electron-log');

const path = require("path");
const IpcM = require('./ipc/ipc_main');
const common = require('./common/common');
const app_cfg = require('./app_config');

app_cfg.set_log('info', false);

function create_window() {
    try{
        const win = new BrowserWindow({
            width: 1560,
            height: 960,
            minWidth : 1560,
            minHeight : 960,
            webPreferences: {
                //sandbox: true,
                nodeIntegration: true,
                preload: path.join(__dirname, "preload.js"),
                backgroundThrottling: false
            },
            offscreen : true
        });
    
        IpcM.register(win);
    
        //win.webContents.openDevTools();
        win.setMenuBarVisibility(false);
        win.loadFile(path.join(__dirname, "index.html"));
    }catch(e){
        log.error(common.get_log_str('app.js', 'create_window', e));
    }
}

app.whenReady().then(() => {
    log.info(common.get_log_str('app.js', 'whenReady', 'App start'));
    create_window();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            create_window();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});