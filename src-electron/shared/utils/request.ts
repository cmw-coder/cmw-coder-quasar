import {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from 'axios';

import { ConfigServiceTrait } from 'shared/types/service/ConfigServiceTrait';
import { NetworkZone } from 'shared/types/service/ConfigServiceTrait/types';
import { WindowServiceTrait } from 'shared/types/service/WindowServiceTrait';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export const requestAuthInterceptor = (
  configServiceGetter: () => ConfigServiceTrait,
) => {
  return async (config: InternalAxiosRequestConfig<unknown>) => {
    const { baseServerUrl, token, username, networkZone } =
      await configServiceGetter().getStore();
    config.baseURL = baseServerUrl;
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    if (networkZone === NetworkZone.Public) {
      // 黄、绿区  需要添加token校验
      config.headers['x-authorization'] = `bearer ${token}`;
    } else {
      config.headers['X-Authenticated-Userid'] = username;
    }
    return config;
  };
};

export const responseRejectInterceptor = (
  configServiceGetter: () => ConfigServiceTrait,
  windowServiceGetter: () => WindowServiceTrait,
  apiRefreshToken: (
    refreshToken: string,
  ) => Promise<{ access_token: string; refresh_token: string }>,
  axiosInstance: AxiosInstance,
) => {
  return async (error: AxiosError<Error>) => {
    if (error.response?.status === 401) {
      const config = error.config;
      if (!config) {
        return Promise.reject(new Error('AxiosError.config is undefined'));
      }
      // token 过期, refreshToken
      const { refreshToken, username, networkZone } =
        await configServiceGetter().getStore();
      const { access_token, refresh_token } =
        await apiRefreshToken(refreshToken);
      await configServiceGetter().setConfigs({
        token: access_token,
        refreshToken: refresh_token,
      });
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      if (networkZone === NetworkZone.Public) {
        // 黄、绿区  需要添加token校验
        config.headers['x-authorization'] = `bearer ${access_token}`;
      } else {
        config.headers['X-Authenticated-Userid'] = username;
      }
      return axiosInstance(config);
    } else if (
      error.response?.status === 400 &&
      error.config?.url?.includes('token/refresh')
    ) {
      // refreshToken 失败, 重新进行登录
      await windowServiceGetter().activeWindow(WindowType.Login);
    }
    return Promise.reject(
      new Error(error?.response?.data?.message || error?.message || 'Error'),
    );
  };
};
