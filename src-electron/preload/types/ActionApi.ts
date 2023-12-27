import { BrowserWindow, ipcRenderer } from 'electron';

import { ActionMessageMapping, ActionType } from 'shared/types/ActionMessage';
import { actionApiKey } from 'shared/types/constants';

// -------------------------------------------------------------------------------------------------------
// ↓↓↓↓↓↓↓↓↓↓                                   Local stuff                                     ↓↓↓↓↓↓↓↓↓↓
// -------------------------------------------------------------------------------------------------------

type GenericCallBack = (data: never) => void;

const handlerMap = new Map<ActionType, Array<GenericCallBack>>();

// -------------------------------------------------------------------------------------------------------
// ↑↑↑↑↑↑↑↑↑↑                                   Local stuff                                     ↑↑↑↑↑↑↑↑↑↑
// -------------------------------------------------------------------------------------------------------

export const registerActionCallback = <T extends keyof ActionMessageMapping>(
  actionType: T,
  callback: (data: ActionMessageMapping[T]['data']) => void
): void => {
  const handlers = handlerMap.get(actionType);
  if (handlers) {
    handlers.push(callback);
    return;
  } else {
    handlerMap.set(actionType, [callback]);
  }
};

export const sendToMain = <T extends keyof ActionMessageMapping>(
  message: ActionMessageMapping[T]
): void => {
  ipcRenderer.send(actionApiKey, message);
};

export const sendToRenderer = <T extends keyof ActionMessageMapping>(
  window: BrowserWindow,
  message: ActionMessageMapping[T]
): void => {
  window.webContents.send(actionApiKey, message);
};

export const triggerActionCallback = (
  actionType: ActionType,
  data: unknown
): void => {
  handlerMap.get(actionType)?.forEach((handler) => handler(<never>data));
};
