import { globalI18n } from 'boot/i18n';
import { Service, ServiceType } from 'shared/types/service';

export const i18nSubPath =
  (baseName: string) =>
  (relativePath: string, data?: Record<string, unknown>) => {
    if (data) {
      return globalI18n.t(`${baseName}.${relativePath}`, data);
    } else {
      return globalI18n.t(`${baseName}.${relativePath}`);
    }
  };

export const getLastDirName = (path: string) => {
  const pathArr = path.split('\\');
  return pathArr.at(-1);
};

export const sleep = (ms: number) => {
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

export const checkUrlAccessible = (url: string, timeout = 3000) =>
  new Promise<boolean>((resolve) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetch(url, {
      signal: controller.signal,
    })
      .then((response) => resolve(response.ok))
      .catch(() => resolve(false))
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
