// Import the parts of Electron we need
const { app, BrowserWindow } = require('electron');

// This function creates the app window
function createWindow() {
  const window = new BrowserWindow({
    width: 900,
    height: 720,
    autoHideMenuBar: true // hides the default menu bar
  });

  // Load our HTML file into the window
  window.loadFile('index.html');
}

// When Electron is ready, create the window
app.whenReady().then(createWindow);

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
