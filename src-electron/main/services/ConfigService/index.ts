import ElectronStore from 'electron-store';
import { injectable } from 'inversify';
import { userInfo } from 'os';
import { extend } from 'quasar';

import { container } from 'main/services';
import { WindowService } from 'main/services/WindowService';
import { LinseerConfigStore } from 'main/stores/config';
import { NetworkZone, defaultAppConfigNetworkZoneMap } from 'shared/config';
import { ToggleDarkModeActionMessage } from 'shared/types/ActionMessage';
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
    // 通知其他窗口切换主题
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    windowService.windowMap.forEach((baseWindow) => {
      baseWindow.sendMessageToRenderer(new ToggleDarkModeActionMessage(dark));
    });
  }
}
