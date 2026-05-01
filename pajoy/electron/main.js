const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const axios = require('axios');

const isDev = !app.isPackaged;
let mainWindow;
let backendProcess;
let tray;
let splashScreen;
let isShuttingDown = false;
let backendRestartCount = 0;
const MAX_RESTART_ATTEMPTS = 3;

function getBackendEntry() {
  return path.join(__dirname, '..', 'backend', 'server.js');
}

// Check if backend is running on a port
function checkBackendHealthy(port = 5179, timeout = 30000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        if (res.statusCode === 200) {
          console.log('✓ Backend is healthy');
          resolve(true);
        } else {
          if (Date.now() - startTime < timeout) {
            setTimeout(check, 500);
          } else {
            console.log('✗ Backend health check timed out');
            resolve(false);
          }
        }
      });
      req.on('error', () => {
        if (Date.now() - startTime < timeout) {
          setTimeout(check, 500);
        } else {
          console.log('✗ Backend not responding');
          resolve(false);
        }
      });
    };
    check();
  });
}

// Create splash screen
function createSplashScreen() {
  splashScreen = new BrowserWindow({
    width: 600,
    height: 400,
    center: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load splash screen HTML
  splashScreen.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>PAJOY Uniforms POS</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1c4dd1 0%, #0c4a3a 100%);
          color: white;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }
        .subtitle {
          font-size: 18px;
          opacity: 0.8;
          margin-bottom: 40px;
        }
        .status {
          font-size: 14px;
          margin: 10px 0;
          opacity: 0.7;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px 0;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error {
          color: #ff6b6b;
          background: rgba(255,255,255,0.1);
          padding: 10px 20px;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="logo">🏫 PAJOY</div>
      <div class="subtitle">Uniforms Point of Sale System</div>
      <div class="status" id="status">Initializing system...</div>
      <div class="spinner"></div>
      <div class="status" id="detail">Loading components...</div>
      <div class="error" id="error" style="display: none;"></div>
      
      <script>
        const { ipcRenderer } = require('electron');
        
        ipcRenderer.on('splash-status', (event, message) => {
          document.getElementById('status').textContent = message.status;
          if (message.detail) document.getElementById('detail').textContent = message.detail;
        });
        
        ipcRenderer.on('splash-error', (event, error) => {
          document.getElementById('error').style.display = 'block';
          document.getElementById('error').textContent = error;
          document.querySelector('.spinner').style.display = 'none';
        });
      </script>
    </body>
    </html>
  `));

  return splashScreen;
}

// Update splash screen status
function updateSplashStatus(status, detail = '') {
  if (splashScreen && !splashScreen.isDestroyed()) {
    splashScreen.webContents.send('splash-status', { status, detail });
  }
}

// Show splash screen error
function showSplashError(error) {
  if (splashScreen && !splashScreen.isDestroyed()) {
    splashScreen.webContents.send('splash-error', error);
  }
}

function startBackend() {
  return new Promise((resolve, reject) => {
    updateSplashStatus('Starting backend server...', 'Initializing database and services');
    
    if (!isDev) {
      // Production: copy seeded DB on first run
      const seededDb = path.join(process.resourcesPath, 'database', 'pajoy.db');
      const targetDb = path.join(process.env.PAJOY_DB_DIR, 'pajoy.db');
      if (fs.existsSync(seededDb) && !fs.existsSync(targetDb)) {
        fs.copyFileSync(seededDb, targetDb);
      }
      // Start the backend server in-process for production
      try {
        require(getBackendEntry());
        console.log('✓ Backend started (in-process)');
        updateSplashStatus('Backend server started', 'Ready for connections');
        resolve();
      } catch (error) {
        console.error('✗ Failed to start backend:', error);
        showSplashError('Failed to start backend server');
        reject(error);
      }
    } else {
      // Development: spawn backend as separate process
      console.log('🔧 Starting backend process...');
      backendProcess = spawn('node', [getBackendEntry()], {
        cwd: app.getAppPath(),
        env: { ...process.env, PAJOY_DB_DIR: process.env.PAJOY_DB_DIR },
        stdio: 'inherit'
      });

      backendProcess.on('error', (error) => {
        console.error('✗ Backend process error:', error);
        showSplashError('Backend process failed to start');
        reject(error);
      });

      backendProcess.on('close', (code) => {
        if (code !== 0 && !isShuttingDown) {
          console.error(`Backend process exited with code ${code}`);
          handleBackendCrash();
        }
      });

      // Wait for backend to be healthy
      setTimeout(() => {
        checkBackendHealthy().then((healthy) => {
          if (healthy) {
            updateSplashStatus('Backend server started', 'All systems operational');
            resolve();
          } else {
            showSplashError('Backend failed to start properly');
            reject(new Error('Backend not healthy'));
          }
        });
      }, 3000);
    }
  });
}

// Handle backend crash
function handleBackendCrash() {
  if (isShuttingDown || backendRestartCount >= MAX_RESTART_ATTEMPTS) {
    showSplashError('Backend crashed and could not be restarted');
    return;
  }

  backendRestartCount++;
  updateSplashStatus('Backend crashed', `Restarting... (Attempt ${backendRestartCount}/${MAX_RESTART_ATTEMPTS})`);
  
  setTimeout(() => {
    startBackend().then(() => {
      backendRestartCount = 0;
      if (tray) {
        tray.displayBalloon({
          icon: path.join(__dirname, '..', 'build', 'icon.png'),
          title: 'PAJOY System',
          content: 'Backend server has been restarted successfully'
        });
      }
    }).catch((error) => {
      console.error('Failed to restart backend:', error);
      if (backendRestartCount >= MAX_RESTART_ATTEMPTS) {
        showSplashError('Backend failed to restart after multiple attempts');
      }
    });
  }, 2000);
}

// Create system tray
function createTray() {
  tray = new Tray(path.join(__dirname, '..', 'build', 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PAJOY System',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Backend Status',
      click: async () => {
        const healthy = await checkBackendHealthy();
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Backend Status',
          message: healthy ? 'Backend is running normally' : 'Backend is not responding'
        });
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isShuttingDown = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('PAJOY Uniforms POS');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
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
    show: false  // Don't show until backend is ready
  });

  // Load UI based on environment
  if (isDev) {
    console.log('🌐 Loading development frontend from http://localhost:5173...');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    console.log('✓ Window shown');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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

app.whenReady().then(async () => {
  try {
    // Create splash screen
    createSplashScreen();
    updateSplashStatus('Initializing PAJOY System...', 'Starting components');
    
    // Create system tray
    createTray();
    
    // Start backend and wait for it to be healthy
    await startBackend();
    
    // Create main window
    updateSplashStatus('Loading user interface...', 'Preparing application window');
    createWindow();
    
    // Close splash screen after main window is ready
    setTimeout(() => {
      if (splashScreen && !splashScreen.isDestroyed()) {
        splashScreen.close();
        splashScreen = null;
      }
    }, 1000);
    
  } catch (error) {
    console.error('Failed to start application:', error);
    showSplashError('Failed to start PAJOY System: ' + error.message);
    
    // Show error dialog
    setTimeout(() => {
      dialog.showErrorBox('PAJOY System - Startup Error', 
        `Failed to start the application:\n\n${error.message}\n\nPlease check the logs and try again.`);
      app.quit();
    }, 2000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  isShuttingDown = true;
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Health check endpoint for backend monitoring
app.on('will-quit', () => {
  if (splashScreen && !splashScreen.isDestroyed()) {
    splashScreen.close();
  }
});
