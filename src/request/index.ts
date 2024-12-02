import { ServiceType } from 'shared/types/service';
import axios, {
  AxiosError,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';
import { NetworkZone } from 'shared/config';
import { useService } from 'utils/common';
import { api_refreshToken } from 'src/request/login';
import { WindowType } from 'app/src-electron/shared/types/WindowType';

const _request = axios.create({
  baseURL: '',
  timeout: 60000,
});
const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);

_request.interceptors.request.use(async (config) => {
  const { baseServerUrl, token, username, networkZone } =
    await configService.getConfigs();
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
});

_request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(response);
      return Promise.reject(new Error(response.data || 'Error'));
    }
  },
  async (error: AxiosError<Error>) => {
    if (error.response?.status === 401) {
      const config = error.config;
      if (!config) {
        return Promise.reject(new Error('AxiosError.config is undefined'));
      }
      // token 过期, refreshToken
      const { refreshToken, username, networkZone } =
        await configService.getConfigs();
      const { access_token, refresh_token } =
        await api_refreshToken(refreshToken);
      await configService.setConfigs({
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
      return _request(config);
    } else if (
      error.response?.status === 400 &&
      error.config?.url?.includes('token/refresh')
    ) {
      // refreshToken 失败, 重新进行登录
      await windowService.activeWindow(WindowType.Login);
    }
    return Promise.reject(
      new Error(error?.response?.data?.message || error?.message || 'Error'),
    );
  },
);

const request = async <T>(config: AxiosRequestConfig, signal?: AbortSignal) => {
  const data = await _request({
    ...config,
    signal,
  });
  return data as unknown as T;
};

export const streamRequest = (
  config: AxiosRequestConfig,
  onData: (progressEvent: AxiosProgressEvent) => void,
  signal?: AbortSignal,
) =>
  _request({
    ...config,
    onDownloadProgress: onData,
    signal,
  });

export default request;
