import { injectable, inject } from 'inversify';
import { WindowService } from 'service/entities/WindowService';
import { TYPES } from 'shared/service-interface/types';
import { ConfigServiceBase } from 'shared/service-interface/ConfigServiceBase';
import { runtimeConfig } from 'shared/config';
import { ApiStyle } from 'shared/types/model';
import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { LinseerConfigType, LinseerDataType } from 'main/stores/config/types';
import { registerAction } from 'preload/types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';

@injectable()
export class ConfigService implements ConfigServiceBase {
  @inject(TYPES.WindowService)
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

  public sayHello(): void {
    console.log('Hello from ConfigService');
    this._windowService.sayHello();
  }

  async saveConfig(data: Partial<LinseerConfigType>) {
    this.configStore.config = data;
  }

  async saveData(data: Partial<LinseerDataType>) {
    this.configStore.data = data;
  }
}
