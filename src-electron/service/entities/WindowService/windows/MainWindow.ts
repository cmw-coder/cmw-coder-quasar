import { BrowserWindow } from 'electron';
import { resolve } from 'path';
import { dataStoreDefault } from 'main/stores/data/default';
import { ActionApi, sendToRenderer } from 'preload/types/ActionApi';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import { container } from 'service';
import type { DataStoreService } from 'service/entities/DataStoreService';
import type { ConfigService } from 'service/entities/ConfigService';
import type { WebsocketService } from 'service/entities/WebsocketService';
import { ServiceType } from 'shared/services';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
  DataStoreLoadActionMessage,
  DebugSyncActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';
import { ChatInsertServerMessage, WsAction } from 'shared/types/WsMessage';
import { BaseWindow } from 'service/entities/WindowService/windows/BaseWindow';

export class MainWindow extends BaseWindow {
  private readonly _actionApi = new ActionApi('main.MainWindow.');

  constructor() {
    super(WindowType.Main);
  }

  get isVisible() {
    return (this._window?.isVisible() && !this._window?.isMinimized()) ?? false;
  }

  protected create() {
    const dataStore = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    ).dataStore;
    const configStore = container.get<ConfigService>(
      ServiceType.CONFIG,
    ).configStore;
    const store = dataStore.store;
    const window = new BrowserWindow({
      width: store.window.main.width,
      height: store.window.main.height,
      useContentSize: true,
      show: store.window.main.show,
      frame: false,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    window.on('closed', () => {
      this._window = undefined;
    });
    window.on('hide', () => {
      const store = dataStore.store;
      store.window.main.show = false;
      dataStore.store = store;
    });
    window.on('resized', () => {
      if (this._window) {
        const store = dataStore.store;
        const [width, height] = this._window.getSize();
        store.window.main.width = width;
        store.window.main.height = height;
        dataStore.store = store;
      }
    });
    window.on('ready-to-show', async () => {
      if (this._window && process.env.NODE_ENV === 'development') {
        this._window.webContents.openDevTools();
      }
    });
    window.on('show', () => {
      const store = dataStore.store;
      store.window.main.show = true;
      dataStore.store = store;
    });

    this._actionApi.register(ActionType.ChatInsert, (content) => {
      const websocketService = container.get<WebsocketService>(
        ServiceType.WEBSOCKET,
      );
      websocketService.send(
        JSON.stringify(
          new ChatInsertServerMessage({
            result: 'success',
            content: content
              .replace(/\r\n?/g, '\r\n')
              .replace(/\r?\n/g, '\r\n'),
          }),
        ),
      );
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
    const websocketService = container.get<WebsocketService>(
      ServiceType.WEBSOCKET,
    );
    websocketService.registerWsAction(WsAction.DebugSync, (message) => {
      if (this._window) {
        sendToRenderer(this._window, new DebugSyncActionMessage(message.data));
      }
    });

    return window;
  }
}