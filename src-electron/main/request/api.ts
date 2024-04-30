import request, { streamRequest } from 'main/request';
import { QuestionTemplateFile } from 'shared/types/QuestionTemplate';
import { QuestionParams } from 'shared/api/QuestionType';
import { AxiosProgressEvent } from 'axios';

// 获取产品线下的模板文件内容
export const api_getProductLineQuestionTemplateFile = (productLine: string) =>
  request<QuestionTemplateFile>({
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
export const api_question = (data: QuestionParams, signal?: AbortSignal) =>
  request(
    {
      url: '/kong/RdTestAiService/chatgpt/question',
      method: 'post',
      data,
    },
    signal,
  );

// AI 流式生成
export const api_questionStream = (
  data: QuestionParams,
  onData: (progressEvent: AxiosProgressEvent) => void,
  signal?: AbortSignal,
) =>
  streamRequest(
    {
      url: '/kong/RdTestAiService/chatgpt/question/stream',
      method: 'post',
      data,
    },
    onData,
    signal,
  );
