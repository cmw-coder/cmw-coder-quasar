import { inject, injectable } from 'inversify';
import {
  I_InvokeService,
  InvokeServiceKey,
} from 'shared/types/service/I_InvokeService';
import 'reflect-metadata';
import { ipcMain } from 'electron';
import { TYPES } from 'service/types';
import { ConfigService } from 'service/entities/ConfigService';

@injectable()
export class InvokeService implements I_InvokeService {
  @inject(TYPES.ConfigService)
  private _configService!: ConfigService;
  constructor() {
    ipcMain.handle(
      InvokeServiceKey,
      (event, functionName: keyof InvokeService, ...payloads: unknown[]) => {
        const func = this[functionName];
        if (typeof func !== 'function') {
          throw new Error('Function not found');
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return func(...payloads);
      },
    );
  }

  init() {
    console.log('InvokeService initialized');
  }

  async sayHello(data: string) {
    console.log('Hello from InvokeService', data);
    this._configService.sayHello();
    return Math.random();
  }
}
