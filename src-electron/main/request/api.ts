import { AxiosProgressEvent } from 'axios';

import request, { streamRequest } from 'main/request';
import { Answer, QuestionParams } from 'shared/types/api';
import { ModelConfigMap } from 'shared/types/service/DataStoreServiceTrait/types';

export const api_refreshToken = (refreshToken: string) =>
  request<{
    refresh_token: string;
    access_token: string;
    token_type: string;
    expires_in: number;
  }>({
    url: '/kong/RdTestLoginService/api/token/refresh',
    method: 'post',
    params: {
      refreshToken,
    },
  });

// 获取产品线下的模板文件内容
export const api_getProductLineQuestionTemplateFile = (productLine: string) =>
  request<ModelConfigMap>({
    url: '/kong/RdTestAiService/template',
    method: 'get',
    params: {
      productLine,
    },
  });

// 代码采集
export const api_collection_code = async (data: {
  question: string;
  acceptCodes: string;
  afterEditCodes: string;
}) => {
  try {
    await request<boolean>({
      url: '/kong/RdTestAiService/chatgpt/collection',
      method: 'post',
      data,
    });
  } catch (e) {
    console.log('上报收集失败', e);
  }
};

// 获取用户支持的模板
export const api_getUserTemplateList = (account: string) =>
  request<string[]>({
    url: `/kong/RdTestAiService-b/template/lib/config?userId=${account}`,
    method: 'get',
  });

// 判断区域
export const api_checkAuthCode = () =>
  request<boolean>({
    url: '/kong/RdTestAiService-b/auth/judgement',
    method: 'get',
  });

// AI 生成
export const api_question = (data: QuestionParams, signal?: AbortSignal) => {
  if (!data.plugin) {
    data.plugin = 'SI';
  }
  return request<Answer[]>(
    {
      url: '/kong/RdTestAiService/chatgpt/question',
      method: 'post',
      data,
    },
    signal,
  );
};

// AI 流式生成
export const api_questionStream = (
  data: QuestionParams,
  onData: (progressEvent: AxiosProgressEvent) => void,
  signal?: AbortSignal,
) => {
  if (!data.plugin) {
    data.plugin = 'SI';
  }
  streamRequest(
    {
      url: '/kong/RdTestAiService/chatgpt/question/stream',
      method: 'post',
      data,
    },
    onData,
    signal,
  );
};
