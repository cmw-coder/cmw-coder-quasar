import { injectable, inject } from 'inversify';
import { WindowService } from './WindowService';
import { TYPES } from 'shared/service-interface/types';
import { I_ConfigService } from 'shared/service-interface/I_ConfigService';

@injectable()
export class ConfigService implements I_ConfigService {
  @inject(TYPES.WindowService)
  private _windowService!: WindowService;
  public sayHello(): void {
    console.log('Hello from ConfigService');
    this._windowService.sayHello();
  }
}
