import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { ControlType, registerControlAction } from 'preload/types/ControlApi';
import { registerWsMessage } from 'main/server';
import { WsAction } from 'shared/types/WsMessage';
import { WindowType } from 'shared/types/WindowType';

export class MainWindow {
  private _window: BrowserWindow | undefined;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  private create() {
    this._window = new BrowserWindow({
      width: 630,
      height: 1120,
      useContentSize: true,
      frame: false,
      icon: resolve(__dirname, 'icons/icon.png'), // taskbar icon
      webPreferences: {
        contextIsolation: true,
        // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    this._window.loadURL(process.env.APP_URL).then();

    if (process.env.DEBUGGING) {
      // if on DEV or Production with debug enabled
      this._window.webContents.openDevTools({ mode: 'undocked' });
    } else {
      // we're on production; no access to devtools pls
      this._window.webContents.on('devtools-opened', () => {
        this._window?.webContents.closeDevTools();
      });
    }

    this._window.on('closed', () => {
      this._window = undefined;
    });

    this._window.on('ready-to-show', () =>
      registerWsMessage(WsAction.DebugSync, (message) =>
        this._window?.webContents.send('action', message)
      )
    );

    registerControlAction(WindowType.Main, ControlType.Close, () =>
      this._window?.close()
    );
    registerControlAction(WindowType.Main, ControlType.Minimize, () =>
      this._window?.minimize()
    );
    registerControlAction(WindowType.Main, ControlType.ToggleMaximize, () => {
      if (this._window?.isMaximized()) {
        this._window?.unmaximize();
      } else {
        this._window?.maximize();
      }
    });
  }
}
