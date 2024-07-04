import { ReviewState, reviewRequestParams } from 'shared/types/review';
import request from 'main/request';
import Logger from 'electron-log/main';
// import { timeout } from 'main/utils/common';

// export const api_code_review = async (data: reviewRequestParams) => {
//   console.log('api_code_review', data);
//   await timeout(150);
//   return '1111-2222-3333-4444';
// };

export const api_code_review = async (data: reviewRequestParams) => {
  Logger.log('api_code_review', data);
  const result = await request<string>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review',
    method: 'post',
    data,
  });
  Logger.log('api_code_review', result);
  return result;
};

// export const api_get_code_review_state = async (reviewId: string) => {
//   console.log('api_get_code_review_state', reviewId);
//   await timeout(150);
//   return ReviewState.Third;
// };

export const api_get_code_review_state = async (reviewId: string) => {
  Logger.log('api_get_code_review_state', reviewId);
  const result = await request<ReviewState>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review/status',
    method: 'get',
    params: {
      taskId: reviewId,
    },
  });
  Logger.log('api_get_code_review_state', result);
  return result;
};

// export const api_get_code_review_result = async (reviewId: string) => {
//   console.log('api_get_code_review_result', reviewId);
//   await timeout(150);
//   throw new Error('api_get_code_review_result error');
//   // return `${reviewId} 没有发现明显问题。`;
// };

export const api_get_code_review_result = async (reviewId: string) => {
  Logger.log('api_get_code_review_result', reviewId);
  const result = request<string>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review/result',
    method: 'get',
    params: {
      taskId: reviewId,
    },
  });
  Logger.log('api_get_code_review_result', result);
  return result;
};
