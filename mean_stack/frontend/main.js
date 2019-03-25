const { app, BrowserWindow } = require("electron");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 1000,
    backgroundColor: "#ffffff",
    icon: `file://${__dirname}/dist/frontend/favicon.ico`,
  });

  win.loadURL(`file://${__dirname}/dist/frontend/index.html`);

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
