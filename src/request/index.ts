import { ServiceType } from 'app/src-electron/shared/services';
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { NetworkZone, runtimeConfig } from 'shared/config';
import { useService } from 'utils/common';

const _request = axios.create({
  baseURL: '',
  timeout: 60000,
});

_request.interceptors.request.use(async (config) => {
  const configService = useService(ServiceType.CONFIG);
  const { baseServerUrl, token, username } = await configService.getConfigs();
  config.baseURL = baseServerUrl;
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }
  if (runtimeConfig.networkZone === NetworkZone.Public) {
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
  (error) => {
    return Promise.reject(
      new Error(error?.response?.data?.message || error?.message || 'Error'),
    );
  },
);

const request = async <T>(config: AxiosRequestConfig) => {
  const data = await _request(config);
  return data as unknown as T;
};

export default request;
