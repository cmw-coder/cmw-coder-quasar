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
