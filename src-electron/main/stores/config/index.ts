import ElectronStore from 'electron-store';

import {
  huggingFaceStoreDefault,
  linseerConfigDefault,
} from 'main/stores/config/default';
import {
  HuggingFaceConfigType,
  HuggingFaceDataType,
  HuggingFaceStoreType,
  LinseerConfigType,
  LinseerDataType,
  LinseerStoreType,
} from 'main/stores/config/types';
import { judgment, refreshToken } from 'main/utils/axios';

export class HuggingFaceConfigStore {
  private _store: ElectronStore<HuggingFaceStoreType>;

  constructor() {
    this._store = new ElectronStore({
      clearInvalidConfig: true,
      defaults: huggingFaceStoreDefault,
      migrations: {
        '1.0.1': (store) => {
          console.info('Migrating "config" store to 1.0.1 ...');
          const oldConfig = store.get('config');
          oldConfig.modelConfigs.forEach(
            (modelConfig) =>
              (modelConfig.completionConfigs.function.maxTokenCount = 1024),
          );
          store.set('config', oldConfig);
        },
        '1.0.3': (store) => {
          console.info('Migrating "config" store to 1.0.3 ...');
          const oldConfig = store.get('config');
          oldConfig.endpoints.feedback =
            huggingFaceStoreDefault.config.endpoints.feedback;
          store.set('config', oldConfig);
        },
        '1.0.4': (store) => {
          console.log('Migrating "config" store to 1.0.4 ...');
          const oldConfig = store.get('config');
          oldConfig.endpoints.collection = huggingFaceStoreDefault.config.endpoints.collection;
          store.set('config', oldConfig);
        },
      },
      name: 'config',
      // schema: huggingFaceStoreSchema,
    });
  }

  get store() {
    return this._store.store;
  }

  get apiStyle() {
    return this._store.get('apiStyle');
  }

  get config(): HuggingFaceConfigType {
    return this._store.get('config');
  }

  set config(config: Partial<HuggingFaceConfigType>) {
    const currentConfig = this.config;
    this._store.set('config', { ...currentConfig, ...config });
  }

  get data(): HuggingFaceDataType {
    return this._store.get('data');
  }

  set data(data: Partial<HuggingFaceDataType>) {
    const currentData = this.data;
    this._store.set('data', { ...currentData, ...data });
  }

  get endpoints() {
    return this.config.endpoints;
  }

  get modelConfig() {
    const { modelConfigs } = this.config;
    const { modelType } = this.data;
    return (
      modelConfigs.find((modelConfig) => modelConfig.modelType === modelType) ??
      modelConfigs[0]
    );
  }

  get modelType() {
    return this.modelConfig.modelType;
  }
}

export class LinseerConfigStore {
  private _store: ElectronStore<LinseerStoreType>;

  constructor() {
    this._store = new ElectronStore({
      clearInvalidConfig: true,
      defaults: linseerConfigDefault,
      migrations: {
        '1.0.1': (store) => {
          console.log('Migrating "config" store to 1.0.1 ...');
          const oldConfig = store.get('config');
          oldConfig.modelConfigs.forEach(
            (modelConfig) =>
              (modelConfig.completionConfigs.line.maxTokenCount = 15),
          );
          store.set('config', oldConfig);
        },
        '1.0.3': (store) => {
          console.log('Migrating "config" store to 1.0.3 ...');
          const oldConfig = store.get('config');
          oldConfig.endpoints.feedback =
            linseerConfigDefault.config.endpoints.feedback;
          store.set('config', oldConfig);
        },
        '1.0.4': (store) => {
          console.log('Migrating "config" store to 1.0.4 ...');
          const oldConfig = store.get('config');
          oldConfig.endpoints.collection = linseerConfigDefault.config.endpoints.collection;
          oldConfig.modelConfigs = linseerConfigDefault.config.modelConfigs;
          store.set('config', oldConfig);
        },
      },
      name: 'config',
      // schema: linseerStoreSchema,
    });
  }

  get store() {
    return this._store.store;
  }

  get apiStyle() {
    return this._store.get('apiStyle');
  }

  get config(): LinseerConfigType {
    return this._store.get('config');
  }

  set config(config: Partial<LinseerConfigType>) {
    const currentConfig = this.config;
    this._store.set('config', { ...currentConfig, ...config });
  }

  get data(): LinseerDataType {
    return this._store.get('data');
  }

  set data(data: Partial<LinseerDataType>) {
    const currentData = this.data;
    this._store.set('data', { ...currentData, ...data });
  }

  get endpoints() {
    return this.config.endpoints;
  }

  get modelConfig() {
    const { modelConfigs } = this.config;
    const { modelType } = this.data;
    return (
      modelConfigs.find((modelConfig) => modelConfig.modelType === modelType) ??
      modelConfigs[0]
    );
  }

  get modelType() {
    return this.modelConfig.modelType;
  }

  async getAccessToken() {
    if ((await this.checkAccessToken()) || (await this.refreshToken())) {
      const { tokens } = this.data;
      return tokens.access;
    }
  }

  async checkAccessToken() {
    const { tokens } = this.data;
    try {
      await judgment(tokens.access);
      return true;
    } catch (e) {
      return false;
    }
  }

  async refreshToken() {
    const currentData = this.data;
    try {
      const { data } = await refreshToken(currentData.tokens.refresh);
      currentData.tokens.access = data.access_token;
      currentData.tokens.refresh = data.refresh_token;
      this.data = currentData;
      return true;
    } catch (e) {
      return false;
    }
  }
}
