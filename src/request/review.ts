import { reviewRequestParams } from 'shared/types/review';
import request from 'src/request';

export const api_code_review = (data: reviewRequestParams) =>
  request({
    url: '/kong/RdTestAiService/chatgpt/question',
    method: 'post',
    data,
  });
