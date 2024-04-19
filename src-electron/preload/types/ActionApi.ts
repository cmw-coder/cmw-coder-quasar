import { BrowserWindow, ipcRenderer } from 'electron';

import { ACTION_API_KEY } from 'shared/constants/common';
import { ActionMessageMapping, ActionType } from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/services';

// -------------------------------------------------------------------------------------------------------
// ↓↓↓↓↓↓↓↓↓↓                                   Local stuff                                     ↓↓↓↓↓↓↓↓↓↓
// -------------------------------------------------------------------------------------------------------

type GenericCallBack = (data: never) => void;

const handlerMap = new Map<ActionType, Map<string, GenericCallBack>>();

// -------------------------------------------------------------------------------------------------------
// ↑↑↑↑↑↑↑↑↑↑                                   Local stuff                                     ↑↑↑↑↑↑↑↑↑↑
// -------------------------------------------------------------------------------------------------------
export class ActionApi {
  private readonly _baseName: string;
  private _registeredActionTypes: Set<keyof ActionMessageMapping> = new Set();

  constructor(baseName: string) {
    this._baseName = baseName;
  }

  register<T extends keyof ActionMessageMapping>(
    actionType: T,
    callback: (data: ActionMessageMapping[T]['data']) => void,
  ): void {
    registerAction(actionType, this._baseName + actionType, callback);
    this._registeredActionTypes.add(actionType);
  }

  unregister(): void {
    for (const actionType of this._registeredActionTypes) {
      unregisterAction(actionType, this._baseName + actionType);
    }
    this._registeredActionTypes.clear();
  }
}

export const invokeToMain = <T extends ServiceType>(
  channel: string,
  serviceName: T,
  functionName: string | symbol,
  ...args: never[]
) => {
  return ipcRenderer.invoke(channel, serviceName, functionName, ...args);
};

export const registerAction = <T extends keyof ActionMessageMapping>(
  actionType: T,
  name: string,
  callback: (data: ActionMessageMapping[T]['data']) => void,
): void => {
  const handlers = handlerMap.get(actionType);
  if (handlers) {
    handlers.set(name, callback);
  } else {
    handlerMap.set(actionType, new Map([[name, callback]]));
  }
};

export const sendToMain = <T extends keyof ActionMessageMapping>(
  message: ActionMessageMapping[T],
): void => {
  ipcRenderer.send(ACTION_API_KEY, message);
};

export const sendToRenderer = <T extends keyof ActionMessageMapping>(
  window: BrowserWindow,
  message: ActionMessageMapping[T],
): void => {
  window.webContents.send(ACTION_API_KEY, message);
};

export const triggerAction = (actionType: ActionType, data: unknown): void => {
  handlerMap.get(actionType)?.forEach((handler) => handler(<never>data));
};

export const unregisterAction = <T extends keyof ActionMessageMapping>(
  actionType: T,
  name: string,
): void => {
  const handlers = handlerMap.get(actionType);
  if (handlers) {
    handlers.delete(name);
  }
};
