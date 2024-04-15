import { app, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log/main';
import { DateTime } from 'luxon';
import { Job, scheduleJob } from 'node-schedule';
import { release, version } from 'os';

import { BaseWindow } from 'main/types/BaseWindow';
import { reportProjectAdditions } from 'main/utils/svn';
import { triggerAction } from 'preload/types/ActionApi';
import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { ACTION_API_KEY, CONTROL_API_KEY } from 'shared/constants/common';
import { ActionMessage } from 'shared/types/ActionMessage';

export const initAdditionReport = (): Job => {
  reportProjectAdditions().catch();
  return scheduleJob(
    {
      hour: 3,
      minute: 0,
    },
    reportProjectAdditions,
  );
};

export const initApplication = () => {
  log.initialize();
  log.transports.file.format = '{text}';
  log.transports.file.transforms.push(({ data, message }) => {
    const { date, level, variables } = message;
    return [
      `[${DateTime.fromJSDate(date).toISO()}] ${variables?.processType}.${level.toUpperCase()}: ${data}`,
    ];
  });

  log.info(`OS version: ${version()} (${release()})`);
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(-1);
  }
  app.setLoginItemSettings({
    openAtLogin: true,
  });
};

export const initIpcMain = () => {
  ipcMain.on(ACTION_API_KEY, (_, message: ActionMessage) =>
    triggerAction(message.type, message.data),
  );
  ipcMain.on(CONTROL_API_KEY, (_, message: ControlMessage) =>
    triggerControlCallback(message.windowType, message.type, message.data),
  );
};

export const initShortcutHandler = () => {
  app.on('browser-window-blur', () => {
    globalShortcut.unregisterAll();
  });
  app.on('browser-window-focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {
      log.debug('CommandOrControl+R is pressed: Shortcut Disabled');
    });
    globalShortcut.register('CommandOrControl+Shift+R', () => {
      log.debug('CommandOrControl+Shift+R is pressed: Shortcut Disabled');
    });
    globalShortcut.register('F5', () => {
      log.debug('F5 is pressed: Shortcut Disabled');
    });
    globalShortcut.register('Shift+F5', () => {
      log.debug('Shift+F5 is pressed: Shortcut Disabled');
    });
  });
};

export const initWindowDestroyInterval = (baseWindow: BaseWindow) =>
  setInterval(
    () => {
      baseWindow.destroy();
    },
    1000 * 60 * 30,
  );
