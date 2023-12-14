import { contextBridge, ipcRenderer } from 'electron';

import { Action } from 'types/action';
import { ActionManager } from 'types/ActionManager';

const actionManager = new ActionManager();

contextBridge.exposeInMainWorld('controlApi', {
  close() {
    ipcRenderer.send('controlApi', 'close');
  },
  minimize() {
    ipcRenderer.send('controlApi', 'minimize');
  },
  toggleMaximize() {
    ipcRenderer.send('controlApi', 'toggleMaximize');
  },
});

contextBridge.exposeInMainWorld('subscribeApi', {
  action(action: Action, callback: (data: never) => void) {
    actionManager.registerAction(action, (message) => callback(message.data));
  },
});

ipcRenderer.on('action', (_, message) => {
  actionManager.handleAction(message);
});
