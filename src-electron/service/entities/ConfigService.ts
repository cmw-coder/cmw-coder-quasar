import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { WindowService } from './WindowService';
import { TYPES } from 'service/types';

@injectable()
export class ConfigService {
  @inject(TYPES.WindowService)
  private _windowService!: WindowService;
  public sayHello(): void {
    console.log('Hello from ConfigService');
    this._windowService.sayHello();
  }
}
