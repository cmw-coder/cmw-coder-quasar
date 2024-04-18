import { BrowserWindow, screen } from 'electron';
import log from 'electron-log/main';
import { resolve } from 'path';

import { BaseWindow } from 'main/types/BaseWindow';
import { ActionApi, sendToRenderer } from 'preload/types/ActionApi';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import {
  ActionType,
  CompletionClearActionMessage,
  CompletionSetActionMessage,
  CompletionUpdateActionMessage,
  DataStoreLoadActionMessage,
  RouterReloadActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';
import { container } from 'service';
import { DataStoreService } from 'service/entities/DataStoreService';
import { ServiceType } from 'shared/services';

export class ImmersiveWindow extends BaseWindow {
  private readonly _actionApi = new ActionApi('main.ImmersiveWindow.');

  constructor() {
    super(WindowType.Immersive);
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
    height: number,
    position: { x: number; y: number },
  ) {
    if (!this._window) {
      this.create();
    }
    if (this._window) {
      const dataStore = container.get<DataStoreService>(
        ServiceType.DATA_STORE,
      ).dataStore;
      if (dataStore.store.compatibility.transparentFallback) {
        const lines = completion.split('\r\n');
        this._window.setBounds(
          {
            height: Math.round(lines.length * 13.3 + 15),
            width: Math.max(
              Math.round(
                Math.max(...lines.map((line) => line.length)) * 7 + 10,
              ),
              100,
            ),
          },
          false,
        );
      }
      if (dataStore.store.compatibility.zoomFix) {
        height = screen.screenToDipPoint({ x: 0, y: height }).y;
        position = screen.screenToDipPoint(position);
      }
      this._window.setPosition(
        Math.round(position.x),
        Math.round(position.y),
        false,
      );

      sendToRenderer(
        this._window,
        new CompletionSetActionMessage({
          completion,
          count,
          fontHeight: height,
        }),
      );

      this._window.show();
    } else {
      log.warn('Immersive window activate failed');
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
      log.warn('Immersive window activate failed');
    }
  }

  hide() {
    this._window?.hide();
  }

  show() {
    this._window?.show();
  }

  protected create() {
    const dataStore = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    ).dataStore;
    this._window = new BrowserWindow({
      width: dataStore.store.compatibility.transparentFallback ? 0 : 3840,
      height: dataStore.store.compatibility.transparentFallback ? 0 : 2160,
      minWidth: 0,
      minHeight: 0,
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
      transparent: !dataStore.store.compatibility.transparentFallback,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    this._window.setAlwaysOnTop(true, 'pop-up-menu');
    this._window.setIgnoreMouseEvents(
      !dataStore.store.compatibility.transparentFallback,
    );

    this._window
      .loadURL(`${process.env.APP_URL}#/immersive/completions`)
      .then();

    this._window.on('ready-to-show', () => {
      if (this._window) {
        // this._window.webContents.openDevTools({ mode: 'undocked' });
      }
    });

    this._actionApi.register(ActionType.DataStoreLoad, () => {
      if (this._window) {
        sendToRenderer(
          this._window,
          new DataStoreLoadActionMessage(dataStore.store),
        );
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
