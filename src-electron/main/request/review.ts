import { ReviewState, reviewRequestParams } from 'shared/types/review';
import request from 'main/request';

export const api_code_review = (data: reviewRequestParams) =>
  request<string>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review',
    method: 'post',
    data,
  });

export const api_get_code_review_state = (reviewId: string) =>
  request<ReviewState>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review/status',
    method: 'get',
    params: {
      taskId: reviewId,
    },
  });

export const api_get_code_review_result = (reviewId: string) =>
  request<string>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review/result',
    method: 'get',
    params: {
      taskId: reviewId,
    },
  });
