import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { registerWsMessage } from 'main/server';
import { dataStore } from 'main/stores';
import { sendToRenderer } from 'preload/types/ActionApi';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import { DebugSyncServerMessage, WsAction } from 'shared/types/WsMessage';
import { WindowType } from 'shared/types/WindowType';
import { DebugSyncActionMessage } from 'shared/types/ActionMessage';

export class MainWindow {
  private readonly _type = WindowType.Main;
  private _window: BrowserWindow | undefined;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  get isVisible() {
    return (this._window?.isVisible() && !this._window?.isMinimized()) ?? false;
  }

  private create() {
    const { height, show, width } = dataStore.window.main;
    this._window = new BrowserWindow({
      width,
      height,
      useContentSize: true,
      show,
      frame: false,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    this._window.loadURL(process.env.APP_URL).catch((e) => {
      if (e.code !== 'ERR_ABORTED') {
        throw e;
      }
    });

    // this._window.webContents.openDevTools({ mode: 'undocked' });

    // this._window.webContents.on('devtools-opened', () => {
    //   this._window?.webContents.closeDevTools();
    // });

    this._window.on('closed', () => {
      this._window = undefined;
    });

    this._window.on('hide', () => {
      const currentDataWindow = dataStore.window;
      currentDataWindow.main.show = false;
      dataStore.window = currentDataWindow;
    });

    this._window.on('resized', () => {
      if (this._window) {
        const [width, height] = this._window.getSize();
        const currentDataWindow = dataStore.window;
        currentDataWindow.main.width = width;
        currentDataWindow.main.height = height;
        dataStore.window = currentDataWindow;
      }
    });

    this._window.on('ready-to-show', async () => {
      registerWsMessage(WsAction.DebugSync, (message) => {
        if (this._window) {
          sendToRenderer(
            this._window,
            new DebugSyncActionMessage(message.data)
          );
        }
        return new DebugSyncServerMessage({ result: 'success' });
      });
    });

    this._window.on('show', () => {
      const currentDataWindow = dataStore.window;
      currentDataWindow.main.show = true;
      dataStore.window = currentDataWindow;
    });

    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(this._type, ControlType.Minimize, () =>
      this._window?.minimize()
    );
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show()
    );
    registerControlCallback(this._type, ControlType.ToggleMaximize, () => {
      if (this._window?.isMaximized()) {
        this._window?.unmaximize();
      } else {
        this._window?.maximize();
      }
    });
  }
}
