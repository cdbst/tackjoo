const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");
const IpcM = require('./ipc_main');
IpcM.register();

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
    win.loadFile(path.join(__dirname, "index.html"))
    //TODO : DELETE TEST CODE (below codes.)
    .then(()=>{

        win.webContents.send('req-sensor-data', 'test');

        ipcMain.once('req-sensor-data-reply', (event, err) => {
            console.log('test req sensor data : data recv');    
        });
    });
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