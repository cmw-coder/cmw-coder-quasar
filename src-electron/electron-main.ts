import { app, ipcMain } from 'electron';

import { startServer } from 'main/server';
import { CompletionInlineWindow } from 'main/components/CompletionInlineWindow';
import { MainWindow } from 'main/components/MainWindow';
import { TrayIcon } from 'main/components/TrayIcon';
import { controlApiKey } from 'shared/types/constants';
import { ControlMessage, triggerControlAction } from 'preload/types/ControlApi';

const completionInlineWindow = new CompletionInlineWindow();
const mainWindow = new MainWindow();
const trayIcon = new TrayIcon();

if (app.requestSingleInstanceLock()) {
  ipcMain.on(controlApiKey, (_, message: ControlMessage) => {
    triggerControlAction(message.windowType, message.type, message.data);
  });
  app.on('activate', mainWindow.activate);
  app.whenReady().then(() => {
    startServer().then(() => {
      trayIcon.activate();
      mainWindow.activate();
      completionInlineWindow.activate();
    });
  });
} else {
  app.quit();
}
