import axios, { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

import { api_refreshToken } from 'main/request/api';
import { getService } from 'main/services';
import { ServiceType } from 'shared/types/service';
import {
  requestAuthInterceptor,
  responseRejectInterceptor,
} from 'shared/utils/request';

const _request = axios.create({
  baseURL: '',
  timeout: 60000,
});

_request.interceptors.request.use(
  requestAuthInterceptor(() => getService(ServiceType.CONFIG)),
);

_request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    } else {
      return Promise.reject(response.data || 'Error');
    }
  },
  responseRejectInterceptor(
    () => getService(ServiceType.CONFIG),
    () => getService(ServiceType.WINDOW),
    (refreshToken: string) => api_refreshToken(refreshToken),
    _request,
  ),
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
