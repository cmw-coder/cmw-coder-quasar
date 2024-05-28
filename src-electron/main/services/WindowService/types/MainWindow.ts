import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
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
    return new BrowserWindow({
      width: 600,
      height: 800,
      useContentSize: true,
      show: false,
      frame: false,
      webPreferences: {
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });
  }
}
