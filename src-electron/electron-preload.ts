/**
 * This file is used specifically for security reasons.
 * Here you can access Node.js stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in a preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from 'electron';

import { Action } from 'types/action';
import { ActionManager } from 'types/ActionManager';

const actionManager = new ActionManager();

// Add declaration for mainWindow
declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    controlApi: {
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
    };
    subscribeApi: {
      action: (
        action: Action,
        callback: (data: string) => void
      ) => void;
    };
  }
}

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
  action(action: Action, callback: (data: string) => void) {
    actionManager.registerAction(action, (message) => callback(message.data));
  },
});

ipcRenderer.on('action', (_, message) => {
  console.log('action', message);
  actionManager.handleAction(message);
});
