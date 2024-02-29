import axios from 'axios';

import {
  GenerateRdRequestData,
  GenerateRdResponseData,
  GenerateRequestData,
  GenerateResponseData,
  JudgmentData,
  RefreshData,
} from 'main/utils/axios/types';

const rdTestLoginService = axios.create({
  baseURL: 'http://rdee.h3c.com/kong/RdTestLoginService/api',
});

const rdTestAiService = axios.create({
  baseURL: 'http://rdee.h3c.com/kong/RdTestAiService',
});

export const refreshToken = async (refreshToken: string) => {
  return await rdTestLoginService.post<RefreshData>(
    '/token/refresh',
    undefined,
    {
      params: {
        refreshToken,
      },
    },
  );
};

export const judgment = async (token: string) => {
  return await rdTestAiService.get<JudgmentData>('/auth/judgment', {
    headers: {
      'x-authorization': `bearer ${token}`,
    },
  });
};

export const generate = async (
  baseURL: string,
  data: GenerateRequestData,
  signal?: AbortSignal,
) => {
  return await axios
    .create({
      baseURL,
      signal,
    })
    .post<GenerateResponseData>('/generate', data);
};

export const generateRd = async (
  baseURL: string,
  data: GenerateRdRequestData,
  accessToken: string,
  signal?: AbortSignal,
) => {
  return await axios
    .create({
      baseURL,
      signal,
    })
    .post<GenerateRdResponseData[]>('/generateCode', data, {
      headers: {
        'x-authorization': `bearer ${accessToken}`,
      },
    });
};
