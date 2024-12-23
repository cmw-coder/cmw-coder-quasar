import log from 'electron-log/main';
import ElectronStore from 'electron-store';
import { injectable } from 'inversify';
import { userInfo } from 'os';
import { extend } from 'quasar';
import { container } from 'main/services';
import { WindowService } from 'main/services/WindowService';
import { LinseerConfigStore } from 'main/stores/config';
import { NetworkZone, defaultAppConfigNetworkZoneMap } from 'shared/config';
import {
  COMPLETION_CONFIG_BOOLEAN_CONSTANTS,
  COMPLETION_CONFIG_NUMBER_CONSTANTS,
} from 'shared/constants/config';
import {
  SwitchLocaleActionMessage,
  ToggleDarkModeActionMessage,
} from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/types/service';
import { ConfigServiceTrait } from 'shared/types/service/ConfigServiceTrait';
import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

const defaultStoreData = extend<AppConfig>(
  true,
  {},
  defaultAppConfigNetworkZoneMap[NetworkZone.Normal],
);
defaultStoreData.username = userInfo().username;

@injectable()
export class ConfigService implements ConfigServiceTrait {
  configStore = new LinseerConfigStore();

  appConfigStore = new ElectronStore<AppConfig>({
    name: 'appConfig',
    defaults: defaultStoreData,
    migrations: {
      '1.2.1': (store) => {
        log.info('Upgrading "appConfig" store to 1.2.1 ...');
        const activeModelKey = store.get('activeModelKey');
        if (activeModelKey === 'CmwCoder') {
          store.set('activeModelKey', 'CMW');
        }
      },
      '1.2.6': (store) => {
        log.info('Upgrading "appConfig" store to 1.2.6 ...');
        store.set('showSelectedTipsWindow', true);
      },
      '1.2.9': (store) => {
        log.info('Upgrading "appConfig" store to 1.2.9 ...');
        const configData = store.store;
        if (
          configData.baseServerUrl === 'http://10.113.36.113' ||
          configData.baseServerUrl === 'http://10.113.36.121/internal-beta'
        ) {
          store.set('baseServerUrl', 'http://10.113.36.121');
        }
      },
      '1.4.0': (store) => {
        log.info('Upgrading "appConfig" store to 1.4.0 ...');
        const configData = store.store;
        if (
          configData.baseServerUrl === 'http://10.113.36.113' ||
          configData.baseServerUrl === 'http://10.113.36.121/internal-beta'
        ) {
          store.set('baseServerUrl', 'http://10.113.36.121');
        }
      },
      '1.4.4': (store) => {
        log.info('Upgrading "appConfig" store to 1.4.4 ...');
        const locale = store.get('locale');
        if (locale === 'ZH-CN') {
          store.set('locale', 'zh-CN');
        }
        store.set(
          'completion',
          Object.fromEntries([
            ...Object.entries(COMPLETION_CONFIG_BOOLEAN_CONSTANTS).map(
              ([key, value]) => [key, value.default],
            ),
            ...Object.entries(COMPLETION_CONFIG_NUMBER_CONSTANTS).map(
              ([key, value]) => [key, value.default],
            ),
          ]),
        );
      },
      '1.5.0': (store) => {
        log.info('Upgrading "appConfig" store to 1.5.0 ...');
        store.set(
          'completion',
          Object.fromEntries([
            ...Object.entries(COMPLETION_CONFIG_BOOLEAN_CONSTANTS).map(
              ([key, value]) => [key, value.default],
            ),
            ...Object.entries(COMPLETION_CONFIG_NUMBER_CONSTANTS).map(
              ([key, value]) => [key, value.default],
            ),
          ]),
        );
        store.set('showSelectedTipsWindow', true);
        store.set('showStatusWindow', true);
      },
    },
  });

  constructor() {}

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

  async setDarkMode(dark: boolean) {
    this.appConfigStore.set('darkMode', dark);
    // Notify other windows that theme has changed
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    windowService.windowMap.forEach((baseWindow) => {
      baseWindow.sendMessageToRenderer(new ToggleDarkModeActionMessage(dark));
    });
  }

  async setLocale(locale: string): Promise<void> {
    this.appConfigStore.set('locale', locale);
    // Notify other windows that locale has changed
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    windowService.windowMap.forEach((baseWindow) => {
      baseWindow.sendMessageToRenderer(new SwitchLocaleActionMessage(locale));
    });
  }
}
