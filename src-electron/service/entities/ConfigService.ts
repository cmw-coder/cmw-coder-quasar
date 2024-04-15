import { injectable, inject } from 'inversify';
import { WindowService } from './WindowService';
import { TYPES } from 'shared/service-interface/types';
import { ConfigServiceBase } from 'shared/service-interface/ConfigServiceBase';

@injectable()
export class ConfigService implements ConfigServiceBase {
  @inject(TYPES.WindowService)
  private _windowService!: WindowService;
  public sayHello(): void {
    console.log('Hello from ConfigService');
    this._windowService.sayHello();
  }
}
