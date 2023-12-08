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

import { contextBridge } from 'electron';
import { BrowserWindow } from '@electron/remote';
import { modificationManager } from 'app/src-fastify/src/types/ModificationManager';
import { main } from 'app/src-fastify/server';

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
      subscribe: (
        name: string,
        callback: (path: string, content: string) => void
      ) => void;
    };
  }
}

contextBridge.exposeInMainWorld('controlApi', {
  minimize() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow === null) {
      console.warn('No focused window found');
      return;
    }

    focusedWindow.minimize();
  },

  toggleMaximize() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow === null) {
      console.warn('No focused window found');
      return;
    }

    if (focusedWindow.isMaximized()) {
      focusedWindow.unmaximize();
    } else {
      focusedWindow.maximize();
    }
  },

  close() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow === null) {
      console.warn('No focused window found');
      return;
    }

    focusedWindow.close();
  },
});

contextBridge.exposeInMainWorld('subscribeApi', {
  subscribe(name: string, callback: (path: string, content: string) => void) {
    modificationManager.subscribe(name, callback);
  },
});

main().then();
