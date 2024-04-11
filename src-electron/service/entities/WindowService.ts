import { injectable } from 'inversify';
import { I_WindowService } from 'shared/types/service/I_WindowService';
import 'reflect-metadata';

@injectable()
export class WindowService implements I_WindowService {
  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
