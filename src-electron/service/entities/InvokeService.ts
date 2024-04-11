import { injectable } from 'inversify';
import { I_InvokeService } from 'service/types/I_InvokeService';

@injectable()
export class InvokeService implements I_InvokeService {
  sayHello(): void {
    console.log('Hello from InvokeService');
  }
}
