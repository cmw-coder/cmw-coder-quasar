import { app, ipcMain, BrowserWindow, Tray, nativeImage, Menu } from 'electron';
import os from 'os';
import path from 'path';

// needed in a case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

const initializeTrayIcon = () => {
  const tray = new Tray(
    nativeImage.createFromPath(path.resolve(__dirname, 'icons/icon.ico'))
  );
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
};

const initializeMainWindow = () => {
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // taskbar icon
    width: 630,
    height: 1120,
    useContentSize: true,
    transparent: false,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      sandbox: false,
    },
  });

  mainWindow.loadURL(process.env.APP_URL).then();

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools({ mode: 'undocked' });
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  ipcMain.on('controlApi', (event, arg) => {
    switch (arg) {
      case 'minimize':
        mainWindow?.minimize();
        break;
      case 'toggleMaximize':
        if (mainWindow?.isMaximized()) {
          mainWindow?.unmaximize();
        } else {
          mainWindow?.maximize();
        }
        break;
      case 'close':
        mainWindow?.close();
        break;
    }
  });
};

if (app.requestSingleInstanceLock()) {
  app.whenReady().then(() => {
    initializeTrayIcon();
    initializeMainWindow();
  });

  app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === undefined) {
      initializeMainWindow();
    }
  });
} else {
  app.quit();
}
