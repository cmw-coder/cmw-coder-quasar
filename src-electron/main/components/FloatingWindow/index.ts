import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { dataStore } from 'main/stores';
import { bypassCors } from 'main/utils/common';
import {
  ControlType,
  registerControlCallback,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { WindowType } from 'shared/types/WindowType';

export class FloatingWindow {
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
    const searchString = new URLSearchParams({
      userId,
      showMain: mainIsVisible ? 'true' : 'false',
    }).toString();
    this._window
      ?.loadURL(`${process.env.APP_URL}#/floating/login?${searchString}`)
      .catch();
  }

  private create() {
    this._window = new BrowserWindow({
      width: 650,
      height: 450,
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
        zoomFactor: 1 / dataStore.window.zoom,
      },
    });

    bypassCors(this._window);

    this._window
      .loadURL(`${process.env.APP_URL}#/floating/completions`)
      .catch();

    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(this._type, ControlType.Reload, () =>
      this._window?.reload()
    );
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show()
    );
  }
}
