const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");
const IpcM = require('./ipc_main');

function createWindow() {
    const win = new BrowserWindow({
        width: 1440,
        height: 960,
        minWidth : 1440,
        minHeight : 960,
        webPreferences: {
            sandbox: true,
            preload: path.join(__dirname, "preload.js")
        },
        offscreen : true
    });

    IpcM.register(win);

    win.webContents.openDevTools();
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, "index.html"))

}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});