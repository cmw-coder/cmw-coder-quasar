import { injectable, inject } from 'inversify';

import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { LinseerConfigType, LinseerDataType } from 'main/stores/config/types';
import { registerAction } from 'preload/types/ActionApi';
import { WindowService } from 'service/entities/WindowService';
import { runtimeConfig } from 'shared/config';
import { ServiceType } from 'shared/services';
import { ConfigServiceBase } from 'shared/services/types/ConfigServiceBase';
import { ActionType } from 'shared/types/ActionMessage';
import { ApiStyle } from 'shared/types/model';

@injectable()
export class ConfigService implements ConfigServiceBase {
  @inject(ServiceType.WINDOW)
  private _windowService!: WindowService;
  configStore =
    runtimeConfig.apiStyle === ApiStyle.HuggingFace
      ? new HuggingFaceConfigStore()
      : new LinseerConfigStore();

  constructor() {
    console.log('ConfigService constructor');
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

  async saveConfig(data: Partial<LinseerConfigType>) {
    this.configStore.config = data;
  }

  async saveData(data: Partial<LinseerDataType>) {
    this.configStore.data = data;
  }
}
