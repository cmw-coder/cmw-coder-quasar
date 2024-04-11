import {
  I_InvokeService,
  InvokeServiceKey,
} from 'shared/types/service/I_InvokeService';

const target = {} as unknown as I_InvokeService;

const invokeServiceProxy = new Proxy(target, {
  get(_, functionName) {
    return (...payloads: unknown[]) => {
      return window.actionApi.invoke(
        InvokeServiceKey,
        functionName,
        ...payloads,
      );
    };
  },
});

export function useInvokeService() {
  return invokeServiceProxy;
}
