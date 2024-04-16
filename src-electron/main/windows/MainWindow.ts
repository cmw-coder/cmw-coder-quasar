import { BrowserWindow } from 'electron';
import { resolve } from 'path';
import { dataStoreDefault } from 'main/stores/data/default';
import { BaseWindow } from 'main/types/BaseWindow';
import { bypassCors } from 'main/utils/common';
import { getChangedFileList, svnCommit } from 'main/utils/svn';
import { ActionApi, sendToRenderer } from 'preload/types/ActionApi';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
  DataStoreLoadActionMessage,
  DebugSyncActionMessage,
  SvnCommitActionMessage,
  SvnDiffActionMessage,
} from 'shared/types/ActionMessage';
import { ChangedFile } from 'shared/types/svn';
import { WindowType } from 'shared/types/WindowType';
import { ChatInsertServerMessage, WsAction } from 'shared/types/WsMessage';
import type { DataStoreService } from 'service/entities/DataStoreService';
import type { ConfigService } from 'service/entities/ConfigService';
import { TYPES } from 'shared/service-interface/types';
import { container } from 'service/inversify.config';
import type { WebsocketService } from 'service/entities/WebsocketService';

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
      TYPES.DataStoreService,
    ).dataStore;
    const configStore = container.get<ConfigService>(
      TYPES.ConfigService,
    ).configStore;
    const store = dataStore.store;
    this._window = new BrowserWindow({
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
      const store = dataStore.store;
      store.window.main.show = false;
      dataStore.store = store;
    });
    this._window.on('resized', () => {
      if (this._window) {
        const store = dataStore.store;
        const [width, height] = this._window.getSize();
        store.window.main.width = width;
        store.window.main.height = height;
        dataStore.store = store;
      }
    });
    this._window.on('ready-to-show', async () => {
      if (this._window) {
        this._window.webContents.openDevTools();
      }
    });
    this._window.on('show', () => {
      const store = dataStore.store;
      store.window.main.show = true;
      dataStore.store = store;
    });

    this._actionApi.register(ActionType.ChatInsert, (content) => {
      const websocketService = container.get<WebsocketService>(
        TYPES.WebsocketService,
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
    this._actionApi.register(ActionType.SvnDiff, async () => {
      if (this._window) {
        const websocketService = container.get<WebsocketService>(
          TYPES.WebsocketService,
        );
        let changedFileList: ChangedFile[] | undefined;
        const projectPath = websocketService.getClientInfo()?.currentProject;
        if (projectPath && dataStore.store.project[projectPath]?.svn[0]) {
          changedFileList = await getChangedFileList(
            dataStore.store.project[projectPath].svn[0].directory,
          );
        }
        sendToRenderer(this._window, new SvnDiffActionMessage(changedFileList));
      }
    });
    this._actionApi.register(ActionType.SvnCommit, async (data) => {
      if (this._window) {
        const websocketService = container.get<WebsocketService>(
          TYPES.WebsocketService,
        );
        const projectPath = websocketService.getClientInfo()?.currentProject;
        if (projectPath && dataStore.store.project[projectPath]?.svn[0]) {
          try {
            await svnCommit(
              dataStore.store.project[projectPath].svn[0].directory,
              data,
            );
            sendToRenderer(this._window, new SvnCommitActionMessage('success'));
          } catch (e) {
            sendToRenderer(this._window, new SvnCommitActionMessage(<string>e));
          }
        } else {
          sendToRenderer(
            this._window,
            new SvnCommitActionMessage('invalidProject'),
          );
        }
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
      TYPES.WebsocketService,
    );
    websocketService.registerWsAction(WsAction.DebugSync, (message) => {
      if (this._window) {
        sendToRenderer(this._window, new DebugSyncActionMessage(message.data));
      }
    });
  }
}
