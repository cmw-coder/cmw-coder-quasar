import { injectable } from 'inversify';
import {
  I_InvokeService,
  InvokeServiceKey,
} from 'shared/types/service/I_InvokeService';
import 'reflect-metadata';
import { ipcMain } from 'electron';

@injectable()
export class InvokeService implements I_InvokeService {
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
    return Math.random();
  }
}
