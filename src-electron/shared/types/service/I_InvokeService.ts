export interface I_InvokeService {
  sayHello(data: string): Promise<number>;
}

export const InvokeServiceKey = 'InvokeService:Call';
