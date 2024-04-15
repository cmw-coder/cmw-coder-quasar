import { injectable } from 'inversify';
import { WindowServiceBase } from 'shared/service-interface/WindowServiceInterBase';

@injectable()
export class WindowService implements WindowServiceBase {
  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
