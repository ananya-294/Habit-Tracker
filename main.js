// main.js
// This is the Electron "main process" file.
// The main process is responsible for creating and controlling
// the desktop window that our app runs inside.

const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// Create the main application window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#F5F8F5", // matches the light theme background (avoids a white flash on load)
    autoHideMenuBar: true, // hides the default menu bar (File, Edit, View, etc.)
    webPreferences: {
      // Keep things simple and safe for a beginner project:
      // no Node.js access inside the web page itself.
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove the default menu bar completely (extra safety on all platforms)
  Menu.setApplicationMenu(null);

  // Load the app's UI
  mainWindow.loadFile("index.html");
}

// This runs once Electron has finished starting up
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create a window if the dock icon is clicked
  // and there are no other windows open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except on macOS,
// where apps commonly stay active until the user quits explicitly)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
