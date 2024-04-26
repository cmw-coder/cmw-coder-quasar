import log from 'electron-log/main';
import ElectronStore from 'electron-store';

import {
  huggingFaceStoreDefaultNormal,
  huggingFaceStoreDefaultRoute,
  linseerConfigDefault,
  linseerConfigDefaultBeta,
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
import { userInfo } from 'os';
import { NetworkZone, runtimeConfig } from 'shared/config';
import { betaApiUserList } from 'shared/constants';

const defaultMapping: Record<NetworkZone, HuggingFaceStoreType> = {
  [NetworkZone.Normal]: huggingFaceStoreDefaultNormal,
  [NetworkZone.Public]: huggingFaceStoreDefaultNormal,
  [NetworkZone.Secure]: huggingFaceStoreDefaultRoute,
};

export class HuggingFaceConfigStore {
  private _store: ElectronStore<HuggingFaceStoreType>;

  constructor() {
    this._store = new ElectronStore({
      clearInvalidConfig: true,
      defaults: defaultMapping[runtimeConfig.networkZone],
      migrations: {
        '1.0.1': (store) => {
          log.info('Upgrading "config" store to 1.0.1 ...');
          const oldConfig = store.get('config');
          oldConfig.modelConfigs.forEach(
            (modelConfig) =>
              (modelConfig.completionConfigs.function.maxTokenCount = 1024),
          );
          store.set('config', oldConfig);
        },
        '1.0.5': (store) => {
          log.info('Upgrading "config" store to 1.0.5 ...');
          const oldConfig = store.get('config');
          oldConfig.endpoints.aiService =
            defaultMapping[
              runtimeConfig.networkZone
            ].config.endpoints.aiService;
          store.set('config', oldConfig);
        },
        '1.1.1': (store) => {
          log.info('Upgrading "config" store to 1.1.1 ...');
          const oldConfig = store.get('config');
          oldConfig.endpoints.update =
            runtimeConfig.networkZone === NetworkZone.Secure
              ? huggingFaceStoreDefaultRoute.config.endpoints.update
              : huggingFaceStoreDefaultNormal.config.endpoints.update;
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
      defaults: betaApiUserList.includes(userInfo().username)
        ? linseerConfigDefaultBeta
        : linseerConfigDefault,
      migrations: {
        '1.0.1': (store) => {
          log.info('Upgrading "config" store to 1.0.1 ...');
          const oldConfig = store.get('config');
          oldConfig.modelConfigs.forEach(
            (modelConfig) =>
              (modelConfig.completionConfigs.line.maxTokenCount = 15),
          );
          store.set('config', oldConfig);
        },
        '1.0.4': (store) => {
          log.info('Upgrading "config" store to 1.0.4 ...');
          const oldConfig = store.get('config');
          oldConfig.modelConfigs = linseerConfigDefault.config.modelConfigs;
          store.set('config', oldConfig);
        },
        '1.0.5': (store) => {
          log.info('Upgrading "config" store to 1.0.5 ...');
          const oldConfig = store.get('config');
          oldConfig.endpoints.aiService =
            linseerConfigDefault.config.endpoints.aiService;
          store.set('config', oldConfig);
        },
        '1.1.0': (store) => {
          if (betaApiUserList.includes(userInfo().username)) {
            log.info('Upgrading "config" store to 1.1.0 ...');
            store.set('config', linseerConfigDefaultBeta.config);
            store.set('apiStyle', linseerConfigDefault.apiStyle);
            store.set('data', linseerConfigDefault.data);
          }
        },
        '1.1.1': (store) => {
          log.info('Upgrading "config" store to 1.1.1 ...');
          const oldConfig = store.get('config');
          if (betaApiUserList.includes(userInfo().username)) {
            oldConfig.endpoints.update =
              linseerConfigDefaultBeta.config.endpoints.update;
            oldConfig.modelConfigs =
              linseerConfigDefaultBeta.config.modelConfigs;
          } else {
            oldConfig.endpoints.update =
              linseerConfigDefault.config.endpoints.update;
          }
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
