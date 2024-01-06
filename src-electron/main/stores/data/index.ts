import ElectronStore from 'electron-store';

import { dataStoreDefault } from 'main/stores/data/default';
import { dataStoreSchema } from 'main/stores/data/schema';
import { DataStoreType, DataWindowType } from 'main/stores/data/types';

export class DataStore {
  private _store: ElectronStore<DataStoreType>;

  constructor() {
    this._store = new ElectronStore({
      clearInvalidConfig: true,
      defaults: dataStoreDefault,
      name: 'data',
      schema: dataStoreSchema,
    });
  }

  get window(): DataWindowType {
    return this._store.get('window');
  }

  set window(window: Partial<DataWindowType>) {
    const currentWindow = this.window;
    this._store.set('window', { ...currentWindow, ...window });
  }
}
