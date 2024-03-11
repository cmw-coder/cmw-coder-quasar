import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { websocketManager } from 'main/components/WebsocketManager';
import { configStore, dataStore } from 'main/stores';
import { dataStoreDefault } from 'main/stores/data/default';
import { bypassCors } from 'main/utils/common';
import { ActionApi, sendToRenderer } from 'preload/types/ActionApi';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
  DataStoreLoadActionMessage,
  DebugSyncActionMessage,
} from 'shared/types/ActionMessage';
import { WsAction } from 'shared/types/WsMessage';
import { WindowType } from 'shared/types/WindowType';

export class MainWindow {
  private readonly _actionApi = new ActionApi('main.MainWindow.');
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

    bypassCors(this._window);

    this._window.loadURL(process.env.APP_URL).catch((e) => {
      if (e.code !== 'ERR_ABORTED') {
        throw e;
      }
    });

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
      if (this._window) {
        // this._window.webContents.openDevTools({ mode: 'undocked' });
      }
    });
    this._window.on('show', () => {
      const currentDataWindow = dataStore.window;
      currentDataWindow.main.show = true;
      dataStore.window = currentDataWindow;
    });

    this._actionApi.register(ActionType.ConfigStoreLoad, () => {
      if (this._window) {
        sendToRenderer(
          this._window,
          new ConfigStoreLoadActionMessage(configStore.store),
        );
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

    registerControlCallback(this._type, ControlType.DevTools, () =>
      this._window?.webContents.openDevTools({ mode: 'undocked' }),
    );
    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide(),
    );
    registerControlCallback(this._type, ControlType.Minimize, () =>
      this._window?.minimize(),
    );
    registerControlCallback(
      this._type,
      ControlType.Resize,
      ({ width, height }) => {
        if (this._window) {
          const defaultSizes = dataStoreDefault.window.main;
          this._window.setSize(
            width ?? defaultSizes.width,
            height ?? defaultSizes.height,
          );
        }
      },
    );
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show(),
    );
    registerControlCallback(this._type, ControlType.ToggleMaximize, () => {
      if (this._window?.isMaximized()) {
        this._window?.unmaximize();
      } else {
        this._window?.maximize();
      }
    });

    websocketManager.registerWsAction(WsAction.DebugSync, (message) => {
      if (this._window) {
        sendToRenderer(this._window, new DebugSyncActionMessage(message.data));
      }
    });
  }
}
