import { injectable } from 'inversify';
import { I_WindowService } from 'shared/service-interface/I_WindowService';

@injectable()
export class WindowService implements I_WindowService {
  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
