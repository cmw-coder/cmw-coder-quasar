import ElectronStore from 'electron-store';

import { dataStoreDefault } from 'main/stores/data/default';
import { dataStoreSchema } from 'main/stores/data/schema';
import {
  DataProjectType,
  DataStoreType,
  DataWindowType,
} from 'main/stores/data/types';

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

  get project(): DataProjectType {
    return this._store.get('project');
  }

  set project(value: Partial<DataProjectType>) {
    const current = this.project;
    this._store.set('project', { ...current, ...value });
  }

  get window(): DataWindowType {
    return this._store.get('window');
  }

  set window(value: Partial<DataWindowType>) {
    const current = this.window;
    this._store.set('window', { ...current, ...value });
  }
}
