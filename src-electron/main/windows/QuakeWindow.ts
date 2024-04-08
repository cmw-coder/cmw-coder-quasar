import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { BaseWindow } from 'main/types/BaseWindow';
import { ActionApi } from 'preload/types/ActionApi';
import { WindowType } from 'shared/types/WindowType';

export class QuakeWindow extends BaseWindow {
  private readonly _actionApi = new ActionApi('main.QuakeWindow.');

  constructor() {
    super(WindowType.Quake);
  }

  protected create() {
    this._window = new BrowserWindow({
      width: 800,
      height: 600,
      center: true,
      useContentSize: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: true,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    this._window.setAlwaysOnTop(true, 'pop-up-menu');
    this._window.loadURL(`${process.env.APP_URL}#/immersive/quake`).then();

    this._window.on('ready-to-show', () => {
      if (this._window) {
        // this._window.webContents.openDevTools({ mode: 'undocked' });
      }
    });
  }
}
