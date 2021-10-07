const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth : 1200,
        minHeight : 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
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
