import { BrowserWindow, screen } from 'electron';
import { resolve } from 'path';

import { dataStore } from 'main/stores';
import { sendToRenderer } from 'preload/types/ActionApi';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import {
  CompletionClearActionMessage,
  CompletionSetActionMessage,
  CompletionUpdateActionMessage,
  RouterReloadActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';

export class ImmersiveWindow {
  private readonly _type = WindowType.Immersive;
  private _window: BrowserWindow | undefined;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  completionClear() {
    if (this._window && this._window.isVisible()) {
      this._window.hide();
      sendToRenderer(this._window, new CompletionClearActionMessage());
    }
  }

  completionSelect(
    completion: string,
    count: { index: number; total: number },
    position: { x: number; y: number },
  ) {
    if (!this._window) {
      this.create();
    }
    if (this._window) {
      sendToRenderer(
        this._window,
        new CompletionSetActionMessage({ completion, count }),
      );
      if (dataStore.window.dipMapping) {
        position = screen.screenToDipPoint(position);
      }
      this._window.setPosition(
        Math.round(position.x),
        Math.round(position.y - 30),
        false,
      );
      this._window.show();
    } else {
      console.warn('Immersive window activate failed');
    }
  }

  completionUpdate(isDelete: boolean) {
    if (!this._window) {
      this.create();
    }
    if (this._window) {
      sendToRenderer(this._window, new CompletionUpdateActionMessage(isDelete));
      this._window.show();
    } else {
      console.warn('Immersive window activate failed');
    }
  }

  hide() {
    this._window?.hide();
  }

  show() {
    this._window?.show();
  }

  private create() {
    this._window = new BrowserWindow({
      width: 3840,
      height: 2160,
      useContentSize: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: false,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
        backgroundThrottling: false,
      },
    });

    this._window.setAlwaysOnTop(true, 'pop-up-menu');
    this._window.setIgnoreMouseEvents(true);

    this._window
      .loadURL(`${process.env.APP_URL}#/immersive/completions`)
      .then();

    this._window.on('ready-to-show', () => {
      if (this._window) {
        this._window.webContents.openDevTools({ mode: 'undocked' });
      }
    });

    registerControlCallback(this._type, ControlType.Close, () => {
      if (this._window) {
        this._window.destroy();
        this._window = undefined;
      }
    });
    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide(),
    );
    registerControlCallback(this._type, ControlType.Move, (data) => {
      if (this._window) {
        const [currentX, currentY] = this._window.getPosition();
        this._window.setPosition(data.x ?? currentX, data.y ?? currentY);
      }
    });
    registerControlCallback(this._type, ControlType.Reload, () => {
      if (this._window) {
        sendToRenderer(this._window, new RouterReloadActionMessage());
      }
    });
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show(),
    );
  }
}
