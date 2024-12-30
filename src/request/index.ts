import axios, { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

import { ServiceType } from 'shared/types/service';
import {
  requestAuthInterceptor,
  responseRejectInterceptor,
} from 'shared/utils/request';
import { api_refreshToken } from 'src/request/login';
import { useService } from 'utils/common';

const _request = axios.create({
  baseURL: '',
  timeout: 60000,
});

_request.interceptors.request.use(
  requestAuthInterceptor(() => useService(ServiceType.CONFIG)),
);

_request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(response);
      return Promise.reject(new Error(response.data || 'Error'));
    }
  },
  responseRejectInterceptor(
    () => useService(ServiceType.CONFIG),
    () => useService(ServiceType.WINDOW),
    api_refreshToken,
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
