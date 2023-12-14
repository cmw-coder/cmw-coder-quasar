import ElectronStore from 'electron-store';

import {
  defaultHuggingFaceData,
  defaultLinseerData,
} from 'main/stores/data/default';
import {
  huggingFaceDataSchema,
  linseerDataSchema,
} from 'main/stores/data/schema';
import { HuggingFaceDataType, LinseerDataType } from 'main/stores/data/types';

export class HuggingFaceDataStore {
  private _store: ElectronStore<HuggingFaceDataType>;

  constructor() {
    this._store = new ElectronStore({
      defaults: defaultHuggingFaceData,
      name: 'data',
      schema: huggingFaceDataSchema,
    });
    console.log(this._store.path);
  }

  get data() {
    return this._store.store;
  }

  set data(data: HuggingFaceDataType) {
    Object.entries(data).forEach(([key, value]) => this._store.set(key, value));
  }

  get modelType() {
    return this._store.get('modelType');
  }
}

export class LinseerDataStore {
  private _store: ElectronStore<LinseerDataType>;

  constructor() {
    this._store = new ElectronStore({
      defaults: defaultLinseerData,
      name: 'data',
      schema: linseerDataSchema,
    });
    console.log(this._store.path);
  }

  get data() {
    return this._store.store;
  }

  set data(data: LinseerDataType) {
    Object.entries(data).forEach(([key, value]) => this._store.set(key, value));
  }

  get modelType() {
    return this._store.get('modelType');
  }
}
