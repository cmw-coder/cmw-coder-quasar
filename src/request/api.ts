import { QuestionTemplateFile } from 'shared/types/QuestionTemplate';
import { AxiosProgressEvent } from 'axios';
import { Answer, FeedbackForm, QuestionParams } from 'shared/api/QuestionType';
import request, { streamRequest } from 'src/request';

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

export const api_questionStream = (
  data: QuestionParams,
  onData: (progressEvent: AxiosProgressEvent) => void,
  signal?: AbortSignal,
) => {
  if (!data.plugin) {
    data.plugin = 'SI';
  }
  return streamRequest(
    {
      url: '/kong/RdTestAiService/chatgpt/question/stream',
      method: 'post',
      data,
    },
    onData,
    signal,
  );
};

export const api_feedback = (data: FeedbackForm) => {
  return request<string>({
    url: '/kong/RdTestAiService-b/chatgpt/feedback',
    method: 'post',
    data,
  });
};

// 获取产品线下的模板文件内容
export const api_getProductLineQuestionTemplateFile = (productLine: string) =>
  request<QuestionTemplateFile>({
    url: '/kong/RdTestAiService/template',
    method: 'get',
    params: {
      productLine,
    },
  });

// 获取用户支持的模板
export const api_getUserTemplateList = (account: string) =>
  request<string[]>({
    url: `/kong/RdTestAiService-b/template/lib/config?userId=${account}`,
    method: 'get',
  });
