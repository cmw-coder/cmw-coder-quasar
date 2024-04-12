import { Service, ServiceCallKey, TYPES } from 'shared/service-interface/types';

function createProxy(serviceName: string) {
  return new Proxy(
    {},
    {
      get(_, functionName) {
        return (...payloads: unknown[]) => {
          return window.actionApi.invoke(
            ServiceCallKey,
            serviceName,
            functionName,
            ...payloads,
          );
        };
      },
    },
  );
}

const servicesProxy = new Proxy(
  {},
  {
    get(_, serviceName) {
      return createProxy(serviceName as string);
    },
  },
);

function useService<T extends TYPES>(serviceName: T): Service<T> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return servicesProxy[serviceName];
}

export default useService;
