import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { historyToHash } from 'main/utils/common';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import { WindowType } from 'shared/types/WindowType';

export class PromptWindow {
  private _window: BrowserWindow | undefined;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  login(userId: string) {
    this.activate();
    this._window?.center();
    this._window?.focus();
    const url = new URL('/floating/login', process.env.APP_URL);
    url.search = new URLSearchParams({ userId }).toString();
    this._window?.loadURL(historyToHash(url).href).catch();
  }

  private create() {
    this._window = new BrowserWindow({
      width: 500,
      height: 500,
      useContentSize: true,
      resizable: false,
      movable: true,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: true,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: false,
      webPreferences: {
        contextIsolation: true,
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    this._window.webContents.openDevTools({ mode: 'undocked' });

    /*this._window.on('ready-to-show', () => {});*/

    registerControlCallback(WindowType.Floating, ControlType.Close, () => {
      this._window?.close();
      this._window = undefined;
    });
    registerControlCallback(WindowType.Floating, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(WindowType.Floating, ControlType.Show, () =>
      this._window?.show()
    );
  }
}
