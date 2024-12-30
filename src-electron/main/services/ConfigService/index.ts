import log from 'electron-log/main';
import ElectronStore from 'electron-store';
import { injectable } from 'inversify';

import { container } from 'main/services';
import { WindowService } from 'main/services/WindowService';

import {
  SwitchLocaleActionMessage,
  ToggleDarkModeActionMessage,
} from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/types/service';
import { ConfigServiceTrait } from 'shared/types/service/ConfigServiceTrait';
import {
  DEFAULT_CONFIG_BASE,
  DEFAULT_CONFIG_MAP,
} from 'shared/types/service/ConfigServiceTrait/constants';
import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

@injectable()
export class ConfigService implements ConfigServiceTrait {
  store = new ElectronStore<AppConfig>({
    name: 'appConfig',
    defaults: DEFAULT_CONFIG_BASE,
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
      '1.5.0': (store) => {
        log.info('Upgrading "appConfig" store to 1.5.0 ...');
        store.set('showSelectedTipsWindow', true);
        store.set('showStatusWindow', true);
      },
      '1.5.1': (store) => {
        log.info('Upgrading "appConfig" store to 1.5.1 ...');
        store.set('locale', 'zh-CN');
        const {
          showSelectedTipsWindow,
          completionConfigs,
          completion,
          generic,
          shortcut,
          statistic,
        } = DEFAULT_CONFIG_MAP[store.get('networkZone')];
        store.set({
          showSelectedTipsWindow,
          completionConfigs,
          completion,
          generic,
          shortcut,
          statistic,
        });
      },
    },
  });

  constructor() {}

  async getStore() {
    return this.store.store;
  }

  async get<Key extends keyof AppConfig>(key: Key): Promise<AppConfig[Key]>;
  async get<Key extends keyof AppConfig>(
    key: Key,
    defaultValue: Required<AppConfig>[Key],
  ): Promise<Required<AppConfig>[Key]>;
  async get<Key extends string, Value = unknown>(
    key: Exclude<Key, keyof AppConfig>,
    defaultValue?: Value,
  ): Promise<Value> {
    return this.store.get(key, defaultValue);
  }

  async set<Key extends keyof AppConfig>(
    key: Key,
    value?: AppConfig[Key],
  ): Promise<void>;
  async set(key: string, value: unknown): Promise<void>;
  async set(object: Partial<AppConfig>): Promise<void>;
  async set<Key extends keyof AppConfig>(
    keyOrObject: Key | string | Partial<AppConfig>,
    value?: unknown,
  ): Promise<void> {
    if (typeof keyOrObject === 'object') {
      this.store.set(keyOrObject);
    } else {
      this.store.set(keyOrObject, value);
    }
  }

  async setConfigs(data: Partial<AppConfig>) {
    this.store.set(data);
  }

  async setDarkMode(dark: boolean) {
    this.store.set('darkMode', dark);
    // Notify other windows that theme has changed
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    windowService.windowMap.forEach((baseWindow) => {
      baseWindow.sendMessageToRenderer(new ToggleDarkModeActionMessage(dark));
    });
  }

  async setLocale(locale: string): Promise<void> {
    this.store.set('locale', locale);
    // Notify other windows that locale has changed
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    windowService.windowMap.forEach((baseWindow) => {
      baseWindow.sendMessageToRenderer(new SwitchLocaleActionMessage(locale));
    });
  }
}
