import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { I_ConfigService } from 'shared/types/service/I_ConfigService';
import { WindowService } from './WindowService';
import { TYPES } from 'service/types';

@injectable()
export class ConfigService implements I_ConfigService {
  @inject(TYPES.WindowService)
  private _windowService!: WindowService;
  public sayHello(): void {
    console.log('Hello from ConfigService');
    this._windowService.sayHello();
  }
}
