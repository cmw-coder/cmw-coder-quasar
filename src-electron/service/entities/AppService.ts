import { ipcMain } from 'electron';
import { injectable } from 'inversify';
import { container } from 'service/inversify.config';
import { I_AppService } from 'shared/service-interface/I_AppService';
import { ServiceCallKey } from 'shared/service-interface/types';

@injectable()
export class AppService implements I_AppService {
  constructor() {
    console.log('AppService constructor');
    ipcMain.handle(
      ServiceCallKey,
      (
        event,
        serviceName: string,
        functionName: keyof AppService,
        ...payloads: unknown[]
      ) => {
        const service = container.get<AppService>(serviceName);
        const func = service[functionName];
        if (typeof func !== 'function') {
          throw new Error('Function not found');
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return func.bind(service)(...payloads);
      },
    );
  }
  init() {
    console.log('AppService initialized');
  }
}
