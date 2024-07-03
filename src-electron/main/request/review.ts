import { ReviewState, reviewRequestParams } from 'shared/types/review';
import request from 'main/request';
// import { timeout } from 'main/utils/common';

// export const api_code_review = async (data: reviewRequestParams) => {
//   console.log('api_code_review', data);
//   await timeout(150);
//   return '1111-2222-3333-4444';
// };

export const api_code_review = (data: reviewRequestParams) =>
  request<string>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review',
    method: 'post',
    data,
  });

// export const api_get_code_review_state = async (reviewId: string) => {
//   console.log('api_get_code_review_state', reviewId);
//   await timeout(150);
//   return ReviewState.Third;
// };

export const api_get_code_review_state = (reviewId: string) =>
  request<ReviewState>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review/status',
    method: 'get',
    params: {
      taskId: reviewId,
    },
  });

// export const api_get_code_review_result = async (reviewId: string) => {
//   console.log('api_get_code_review_result', reviewId);
//   await timeout(150);
//   throw new Error('api_get_code_review_result error');
//   // return `${reviewId} 没有发现明显问题。`;
// };

export const api_get_code_review_result = (reviewId: string) =>
  request<string>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review/result',
    method: 'get',
    params: {
      taskId: reviewId,
    },
  });
