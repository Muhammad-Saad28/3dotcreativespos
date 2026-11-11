const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Ensure environment variables from .env are loaded
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
  console.log('dotenv not loaded or .env missing:', e);
}

// Fallback environment credentials in production if needed
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lxkkpbwaiigkxqskdysf.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4a2twYndhaWlna3hxc2tkeXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDM3OTIsImV4cCI6MjEwODQxOTc5Mn0.iy4-sKHQHLepkdRPHtSEFrwl8_V3Q7fky4MQVtBLqE8';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4a2twYndhaWlna3hxc2tkeXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjg0Mzc5MiwiZXhwIjoyMTA4NDE5NzkyfQ.5hsycja3LAXilXnwGEx1byV2tjQpRaCQK2RjX0vHVrs';

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

let mainWindow = null;
let serverProcess = null;

async function startServer() {
  if (isDev) {
    return `http://localhost:${PORT}`;
  }

  // In production desktop mode, run the standalone Next.js server or custom http server
  return new Promise((resolve, reject) => {
    try {
      const http = require('http');
      const next = require('next');
      
      const nextApp = next({
        dev: false,
        dir: __dirname,
      });
      const handle = nextApp.getRequestHandler();

      nextApp.prepare().then(() => {
        const server = http.createServer((req, res) => {
          handle(req, res);
        });

        server.listen(0, '127.0.0.1', () => {
          const port = server.address().port;
          console.log(`Desktop Next.js server running on port ${port}`);
          resolve(`http://127.0.0.1:${port}`);
        });

        server.on('error', (err) => {
          console.error('Server error:', err);
          reject(err);
        });
      }).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

function createWindow(url) {
  const iconPath = path.join(__dirname, 'public', 'favicon.ico');

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: '3Dot Creatives POS Software',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    backgroundColor: '#1a1d13',
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
  });

  mainWindow.loadURL(url);

  // Open links in external browser if external
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes('127.0.0.1') && !url.includes('localhost')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      const url = await startServer();
      createWindow(url);

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow(url);
        }
      });
    } catch (err) {
      console.error('Failed to initialize desktop application:', err);
      app.quit();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
