import { injectable } from 'inversify';
import { I_WindowService } from 'service/types/I_WindowService';

@injectable()
export class WindowService implements I_WindowService {
  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
