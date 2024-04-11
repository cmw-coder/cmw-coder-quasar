import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class WindowService {
  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
