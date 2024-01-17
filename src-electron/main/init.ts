import { ipcMain } from 'electron';
import { release, version } from 'os';

import { triggerActionCallback } from 'preload/types/ActionApi';
import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { ActionMessage } from 'shared/types/ActionMessage';

export const initApplication = () => {
  console.log(`OS version: ${version()} (${release()})`);
};

export const initIpcMain = () => {
  ipcMain.on(actionApiKey, (_, message: ActionMessage) =>
    triggerActionCallback(message.type, message.data)
  );
  ipcMain.on(controlApiKey, (_, message: ControlMessage) =>
    triggerControlCallback(message.windowType, message.type, message.data)
  );
};
