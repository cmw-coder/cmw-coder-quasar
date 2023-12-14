import ElectronStore from 'electron-store';

import {
  defaultHuggingFaceConfig,
  defaultLinseerConfig,
} from 'main/stores/config/default';
import {
  huggingFaceConfigSchema,
  linseerConfigSchema,
} from 'main/stores/config/schema';
import {
  HuggingFaceConfigType,
  LinseerConfigType,
} from 'main/stores/config/types';

export class HuggingFaceConfigStore {
  private _store: ElectronStore<HuggingFaceConfigType>;

  constructor() {
    this._store = new ElectronStore({
      defaults: defaultHuggingFaceConfig,
      name: 'config',
      schema: huggingFaceConfigSchema,
    });
    console.log(this._store.path);
  }

  get config() {
    return this._store.store;
  }

  set config(config: HuggingFaceConfigType) {
    Object.entries(config).forEach(([key, value]) =>
      this._store.set(key, value)
    );
  }

  get defaultModelType() {
    return this._store.get('modelConfigs')[0].modelType;
  }

  get statistics(): string {
    return this._store.get('statistics');
  }
}

export class LinseerConfigStore {
  private _store: ElectronStore<LinseerConfigType>;

  constructor() {
    this._store = new ElectronStore({
      defaults: defaultLinseerConfig,
      name: 'config',
      schema: linseerConfigSchema,
    });
    console.log(this._store.path);
  }

  get config() {
    return this._store.store;
  }

  set config(config: LinseerConfigType) {
    Object.entries(config).forEach(([key, value]) =>
      this._store.set(key, value)
    );
  }

  get defaultModelType() {
    return this._store.get('modelConfigs')[0].modelType;
  }

  get statistics() {
    return this._store.get('statistics');
  }
}
