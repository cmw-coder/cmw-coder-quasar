import { Service, ServiceType } from 'shared/services';

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const useService = <T extends ServiceType>(serviceName: T): Service<T> =>
  <Service<T>>new Proxy(
    {},
    {
      get:
        (_, functionName) =>
        (...payloads: never[]) =>
          window.actionApi.service(serviceName, functionName, ...payloads),
    },
  );
