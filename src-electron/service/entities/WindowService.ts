import { injectable } from 'inversify';

@injectable()
export class WindowService {
  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
