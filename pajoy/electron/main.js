const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;
let mainWindow;
let backendProcess;

function getBackendEntry() {
  return path.join(__dirname, '..', 'backend', 'server.js');
}

function startBackend() {
  // In production we require() the backend in-process so packaged app has no extra Node binary needed.
  if (!isDev) {
    try {
      process.env.PAJOY_DB_DIR = path.join(app.getPath('userData'), 'pajoy-db');
      if (!fs.existsSync(process.env.PAJOY_DB_DIR)) {
        fs.mkdirSync(process.env.PAJOY_DB_DIR, { recursive: true });
      }
      // Copy seeded DB on first run
      const seededDb = path.join(process.resourcesPath, 'database', 'pajoy.db');
      const targetDb = path.join(process.env.PAJOY_DB_DIR, 'pajoy.db');
      if (fs.existsSync(seededDb) && !fs.existsSync(targetDb)) {
        fs.copyFileSync(seededDb, targetDb);
      }
      // Start the backend server in production
      require(getBackendEntry());
    } catch (error) {
      console.error('Failed to start backend:', error);
    }
  }
  // In dev we run backend separately via npm script (concurrently).
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    backgroundColor: '#0b0f1a',
    title: 'PAJOY System',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: true
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      // Fallback: try loading from app.asar
      const fallbackPath = path.join(process.resourcesPath, 'app', 'frontend', 'dist', 'index.html');
      mainWindow.loadFile(fallbackPath).catch(fallbackErr => {
        console.error('Failed to load fallback index.html:', fallbackErr);
      });
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC: backup / restore
ipcMain.handle('pajoy:backup', async () => {
  const dbPath = isDev
    ? path.join(__dirname, '..', 'database', 'pajoy.db')
    : path.join(process.env.PAJOY_DB_DIR, 'pajoy.db');
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Backup PAJOY database',
    defaultPath: `pajoy-backup-${new Date().toISOString().slice(0, 10)}.db`,
    filters: [{ name: 'SQLite DB', extensions: ['db'] }]
  });
  if (canceled || !filePath) return { ok: false };
  fs.copyFileSync(dbPath, filePath);
  return { ok: true, filePath };
});

ipcMain.handle('pajoy:restore', async () => {
  const dbPath = isDev
    ? path.join(__dirname, '..', 'database', 'pajoy.db')
    : path.join(process.env.PAJOY_DB_DIR, 'pajoy.db');
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Restore PAJOY database',
    filters: [{ name: 'SQLite DB', extensions: ['db'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths[0]) return { ok: false };
  fs.copyFileSync(filePaths[0], dbPath);
  return { ok: true, restartRequired: true };
});

ipcMain.handle('pajoy:print-receipt', async (_e, html) => {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  win.webContents.print({ silent: false, printBackground: true }, () => win.close());
  return { ok: true };
});

app.whenReady().then(() => {
  startBackend();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
