import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TYPES } from 'service/types';
import { I_ConfigService } from 'service/types/I_ConfigService';
import { WindowService } from './WindowService';

@injectable()
export class ConfigService implements I_ConfigService {
  @inject(TYPES.WindowService)
  private _windowService!: WindowService;
  public sayHello(): void {
    console.log('Hello from ConfigService');
    this._windowService.sayHello();
  }
}
