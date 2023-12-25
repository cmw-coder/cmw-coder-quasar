import ElectronStore from 'electron-store';

import {
  huggingFaceStoreDefault,
  defaultLinseerConfig,
} from 'main/stores/config/default';
import {
  huggingFaceStoreSchema,
  linseerStoreSchema,
} from 'main/stores/config/schema';
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
      defaults: huggingFaceStoreDefault,
      schema: huggingFaceStoreSchema,
    });
    console.log(this._store.path);
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

  get modelConfig() {
    const { modelConfigs } = this.config;
    const { modelType } = this.data;
    return (
      modelConfigs.find((modelConfig) => modelConfig.modelType === modelType) ??
      modelConfigs[0]
    );
  }

  get modelType() {
    // Sanitize modelType
    return this.modelConfig.modelType;
  }

  get statistics() {
    return this.config.statistics;
  }
}

export class LinseerConfigStore {
  private _loginHandler: ((userId: string) => void) | undefined;
  private _store: ElectronStore<LinseerStoreType>;

  constructor() {
    this._store = new ElectronStore({
      defaults: defaultLinseerConfig,
      schema: linseerStoreSchema,
    });
    console.log(this._store.path);
  }

  get apiStyle() {
    return this._store.get('apiStyle');
  }

  get config(): LinseerConfigType {
    return this._store.get('config');
  }

  set config(config: Partial<LinseerConfigType>) {
    Object.entries(config).forEach(([key, value]) =>
      this._store.set(key, value)
    );
  }

  get data(): LinseerDataType {
    return this._store.get('data');
  }

  set data(data: Partial<LinseerDataType>) {
    const currentData = this.data;
    this._store.set('data', { ...currentData, ...data });
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
    // Sanitize modelType
    const currentModelConfig = this.modelConfig;
    return currentModelConfig.modelType;
  }

  get statistics() {
    return this.config.statistics;
  }

  set onLogin(handler: (userId: string) => void) {
    this._loginHandler = handler;
  }

  login() {
    this._loginHandler?.(this.config.userId);
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
