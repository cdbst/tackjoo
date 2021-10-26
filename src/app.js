const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");
const IpcM = require('./ipc_main');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        minWidth : 1280,
        minHeight : 900,
        webPreferences: {
            sandbox: true,
            preload: path.join(__dirname, "preload.js")
        },
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