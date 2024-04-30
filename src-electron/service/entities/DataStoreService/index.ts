import ElectronStore from 'electron-store';
import { injectable } from 'inversify';
import { release } from 'os';

import { DataStore } from 'main/stores/data';
import { DataStoreType } from 'main/stores/data/types';
import { registerAction } from 'preload/types/ActionApi';
import { DataStoreServiceBase } from 'shared/services/types/DataStoreServiceBase';
import { ActionType } from 'shared/types/ActionMessage';
import { AppData, WindowData, defaultAppData } from 'shared/types/AppData';
import { deepClone } from 'shared/utils';
import { WindowType } from 'shared/types/WindowType';

const defaultStoreData = deepClone(defaultAppData);

defaultStoreData.compatibility.transparentFallback =
  parseInt(release().split('.')[0]) < 10;

@injectable()
export class DataStoreService implements DataStoreServiceBase {
  /**
   * @deprecated
   */
  dataStore = new DataStore();

  private appDataStore = new ElectronStore<AppData>({
    name: 'appData',
    defaults: defaultStoreData,
  });

  constructor() {
    registerAction(
      ActionType.DataStoreSave,
      `main.stores.${ActionType.DataStoreSave}`,
      (data) => {
        this.dataStore.store = data;
      },
    );
  }

  async save(data: Partial<DataStoreType>) {
    this.dataStore.store = data;
  }

  getWindowData(windowType: WindowType) {
    const windowData = this.appDataStore.get('window');
    return windowData[windowType];
  }

  saveWindowData(windowType: WindowType, data: WindowData) {
    const windowData = this.appDataStore.get('window');
    windowData[windowType] = data;
    this.appDataStore.set('window', windowData);
  }

  getAppdata() {
    return this.appDataStore.store;
  }
}
