import { app } from 'electron';

import { startServer } from 'main/server';
import { CompletionInlineWindow } from 'main/components/CompletionInlineWindow';
import { MainWindow } from 'main/components/MainWindow';
import { TrayIcon } from 'main/components/TrayIcon';

const completionInlineWindow = new CompletionInlineWindow();
const mainWindow = new MainWindow();
const trayIcon = new TrayIcon();

if (app.requestSingleInstanceLock()) {
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
