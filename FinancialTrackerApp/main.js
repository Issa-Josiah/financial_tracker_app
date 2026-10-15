const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataFilePath = path.join(app.getPath('userData'), 'data.csv');

function createWindow () {
  const win = new BrowserWindow({
    width: 1320,
    height: 900,
    backgroundColor: '#020617',
    icon: path.join(__dirname, 'cash.ico'), // Loads your custom desktop icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Remove the default application menu bar for a cleaner desktop app feel
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler to load data
ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading data file:", err);
  }
  return null;
});

// IPC Handler to save data
ipcMain.handle('save-data', async (event, payload) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error saving data file:", err);
    return false;
  }
});

// IPC Handler to toggle/open Developer Console (DevTools)
ipcMain.on('toggle-dev-tools', (event) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools();
    }
  }
});

// IPC Handler for graceful application shutdown
ipcMain.on('app-quit', () => {
  app.quit();
});