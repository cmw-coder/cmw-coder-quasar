import ElectronStore from 'electron-store';
import { injectable } from 'inversify';
import { extend } from 'quasar';
import { userInfo } from 'os';

import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { registerAction } from 'preload/types/ActionApi';
import {
  NetworkZone,
  defaultAppConfigNetworkZoneMap,
  runtimeConfig,
} from 'shared/config';
import { ConfigServiceTrait } from 'shared/types/service/ConfigServiceTrait';
import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';
import { ActionType } from 'shared/types/ActionMessage';
import { ApiStyle } from 'shared/types/model';
import { betaApiUserList } from 'shared/constants/common';

const defaultStoreData = extend<AppConfig>(
  true,
  {},
  defaultAppConfigNetworkZoneMap[NetworkZone.Normal],
);
defaultStoreData.username = userInfo().username;

@injectable()
export class ConfigService implements ConfigServiceTrait {
  // 临时指定用户使用LinseerBeta版本
  /**
   * @deprecated
   */
  configStore = betaApiUserList.includes(userInfo().username)
    ? new LinseerConfigStore()
    : runtimeConfig.apiStyle === ApiStyle.HuggingFace
      ? new HuggingFaceConfigStore()
      : new LinseerConfigStore();

  appConfigStore = new ElectronStore<AppConfig>({
    name: 'appConfig',
    defaults: defaultStoreData,
  });

  constructor() {
    registerAction(
      ActionType.ConfigStoreSave,
      `main.stores.${ActionType.ConfigStoreSave}`,
      ({ type, data }) => {
        switch (type) {
          case 'config': {
            this.configStore.config = data;
            break;
          }
          case 'data': {
            this.configStore.data = data;
            break;
          }
        }
      },
    );
  }

  getConfigsSync() {
    return this.appConfigStore.store;
  }

  async getConfigs() {
    return this.appConfigStore.store;
  }

  async getConfig<T extends keyof AppConfig>(key: T) {
    return this.appConfigStore.get(key);
  }

  async setConfig<T extends keyof AppConfig>(key: T, value: AppConfig[T]) {
    this.appConfigStore.set(key, value);
  }

  async setConfigs(data: Partial<AppConfig>) {
    this.appConfigStore.set(data);
  }
}
