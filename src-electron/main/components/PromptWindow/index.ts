import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { bypassCors, historyToHash } from 'main/utils/common';
import {
  ControlType,
  registerControlCallback,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { WindowType } from 'shared/types/WindowType';

export class PromptWindow {
  private readonly _type = WindowType.Floating;
  private _window: BrowserWindow | undefined;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  login(userId: string, mainIsVisible: boolean) {
    if (mainIsVisible) {
      triggerControlCallback(WindowType.Main, ControlType.Hide, undefined);
    }
    this.activate();
    this._window?.center();
    this._window?.focus();
    const url = new URL('/floating/login', process.env.APP_URL);
    url.search = new URLSearchParams({
      userId,
      showMain: mainIsVisible ? 'true' : 'false',
    }).toString();
    this._window?.loadURL(historyToHash(url).href).catch();
  }

  private create() {
    this._window = new BrowserWindow({
      width: 800,
      height: 600,
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
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    bypassCors(this._window);

    this._window.webContents.openDevTools({ mode: 'undocked' });

    /*this._window.on('ready-to-show', () => {});*/

    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show()
    );
  }
}
