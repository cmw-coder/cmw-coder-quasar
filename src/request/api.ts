import { AxiosProgressEvent } from 'axios';
import { QuestionParams } from 'shared/api/QuestionType';
import request, { streamRequest } from 'src/request';

export const api_question = (data: QuestionParams, signal?: AbortSignal) =>
  request(
    {
      url: '/kong/RdTestAiService/chatgpt/question',
      method: 'post',
      data,
    },
    signal,
  );

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
