import ElectronStore from 'electron-store';
import { injectable } from 'inversify';
import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { LinseerConfigType, LinseerDataType } from 'main/stores/config/types';
import { userInfo } from 'os';
import { registerAction } from 'preload/types/ActionApi';
import {
  NetworkZone,
  defaultAppConfigNetworkZoneMap,
  runtimeConfig,
} from 'shared/config';
import { betaApiUserList } from 'shared/constants';
import { ConfigServiceBase } from 'shared/services/types/ConfigServiceBase';
import { ActionType } from 'shared/types/ActionMessage';
import { AppConfig } from 'shared/types/AppConfig';
import { ApiStyle } from 'shared/types/model';
import { deepClone } from 'shared/utils';

const defaultStoreData = deepClone(
  defaultAppConfigNetworkZoneMap[NetworkZone.Normal],
);
defaultStoreData.username = userInfo().username;

@injectable()
export class ConfigService implements ConfigServiceBase {
  // 临时指定用户使用LinseerBeta版本
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

  /**
   * @deprecated
   */
  async saveConfig(data: Partial<LinseerConfigType>) {
    this.configStore.config = data;
  }

  /**
   * @deprecated
   */
  async saveData(data: Partial<LinseerDataType>) {
    this.configStore.data = data;
  }
}
