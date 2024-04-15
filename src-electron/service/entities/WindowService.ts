import { injectable } from 'inversify';
import { WindowServiceBase } from 'shared/service-interface/WindowServiceInterface';

@injectable()
export class WindowService implements WindowServiceBase {
  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
