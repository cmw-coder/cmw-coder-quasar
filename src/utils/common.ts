import { Service, ServiceType } from 'shared/services';

export const getLastDirName = (path: string) => {
  const pathArr = path.split('\\');
  return pathArr.at(-1);
};

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

export const checkUrlAccessible = (url: string, timeout = 5000) => {
  return new Promise<void>((resolve, reject) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    fetch(url, {
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok) {
          resolve();
        } else {
          reject();
        }
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        clearTimeout(id);
      });
  });
};
