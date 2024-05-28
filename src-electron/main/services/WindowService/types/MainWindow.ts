import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { dataStoreDefault } from 'main/stores/data/default';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';

export class MainWindow extends BaseWindow {
  private _dataStoreService: DataStoreService;

  constructor() {
    super(WindowType.Main);
    this._dataStoreService = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    );
  }

  protected create() {
    const window = this._createWindow();

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

    return window;
  }

  private _createWindow() {
    const { height, width, show } = this._dataStoreService.getWindowData(
      WindowType.Main,
    );
    return new BrowserWindow({
      width,
      height,
      useContentSize: true,
      show,
      frame: false,
      webPreferences: {
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });
  }
}
