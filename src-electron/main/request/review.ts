import {
  ReviewResult,
  ReviewState,
  reviewRequestParams,
} from 'shared/types/review';
import request from 'main/request';
import Logger from 'electron-log/main';

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

const parseReviewResult = (data: string): ReviewResult => {
  const result: ReviewResult = {
    parsed: false,
    originData: data,
    data: [],
  };
  try {
    const object = JSON.parse(data);
    if (
      object['明确问题'] &&
      Object.prototype.toString.call(object['明确问题']) === '[object Array]'
    ) {
      const problems = object['明确问题'];
      result.data = problems.map((problem: never) => {
        return {
          index: problem['问题编号'],
          type: problem['问题类型'],
          code: problem['问题代码片段'],
          description: problem['问题描述'],
        };
      });
      result.parsed = true;
    } else {
      throw new Error('解析失败');
    }
  } catch (error) {
    Logger.error('parseReviewResult error', error);
  }
  return result;
};

export const api_get_code_review_result = async (
  reviewId: string,
): Promise<ReviewResult> => {
  Logger.log('api_get_code_review_result', reviewId);
  const result = await request<string>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/review/result',
    method: 'get',
    params: {
      taskId: reviewId,
    },
  });
  Logger.log('api_get_code_review_result', result);
  return parseReviewResult(result);
};
