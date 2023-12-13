import { app, ipcMain, nativeImage, BrowserWindow, Menu, Tray } from 'electron';
import { resolve } from 'path';

import { forwardActions, startServer } from 'main/server';

let mainWindow: BrowserWindow | undefined;

const initializeTrayIcon = () => {
  const tray = new Tray(
    nativeImage.createFromPath(resolve(__dirname, 'icons/icon.ico'))
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
    icon: resolve(__dirname, 'icons/icon.png'), // taskbar icon
    width: 630,
    height: 1120,
    useContentSize: true,
    transparent: false,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
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
  app.whenReady().then(async () => {
    initializeTrayIcon();
    initializeMainWindow();
    if (mainWindow) {
      forwardActions(mainWindow.webContents);
      await startServer();
    } else {
      app.quit();
    }
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (mainWindow === undefined) {
      initializeMainWindow();
    }
  });
} else {
  app.quit();
}
