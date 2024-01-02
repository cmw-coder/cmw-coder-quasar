import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { bypassCors } from 'main/utils/common';
import { sendToRenderer } from 'preload/types/ActionApi';
import {
  ControlType,
  registerControlCallback,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { CompletionDisplayActionMessage } from 'shared/types/ActionMessage';
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

  set completion(message: CompletionDisplayActionMessage) {
    if (message.data.completions.length) {
      this.activate();
      if (this._window) {
        this._window.setSize(630, 560);
        sendToRenderer(this._window, message);
      } else {
        console.warn('Floating window activate failed');
      }
    } else {
      if (this._window && this._window.isVisible()) {
        this._window.hide();
        sendToRenderer(this._window, message);
      }
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
      },
    });

    bypassCors(this._window);

    this._window
      .loadURL(`${process.env.APP_URL}#/floating/completions`)
      .catch();

    this._window.webContents.openDevTools({ mode: 'undocked' });

    // this._window.webContents.openDevTools({ mode: 'undocked' });

    /*this._window.on('ready-to-show', () => {});*/

    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show()
    );
  }
}
