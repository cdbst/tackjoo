const { app, BrowserWindow, ipcMain} = require("electron");

const path = require("path");
const mainIPC = require('./main_ipc');

mainIPC.run();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        minWidth : 1200,
        minHeight : 900,
        webPreferences: {
            sandbox: true,
            preload: path.join(__dirname, "preload.js")
        },
    });
    win.webContents.openDevTools();
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, "index.html"));
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