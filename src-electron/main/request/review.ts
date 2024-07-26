// import {
//   ReviewResult,
//   ReviewState,
//   ReviewRequestParams,
//   Feedback,
// } from 'shared/types/review';
// import request from 'main/request';
// import Logger from 'electron-log/main';

// export const api_code_review = async (data: ReviewRequestParams) => {
//   Logger.log('api_code_review start', data);
//   const result = await request<string>({
//     url: '/kong/RdTestAiService/v1/chatgpt/question/review',
//     method: 'post',
//     data,
//   });
//   Logger.log('api_code_review end', result);
//   return result;
// };

// export const api_get_code_review_state = async (reviewId: string) =>
//   request<ReviewState>({
//     url: '/kong/RdTestAiService/v1/chatgpt/question/review/status',
//     method: 'get',
//     params: {
//       taskId: reviewId,
//     },
//   });

// const parseReviewResult = (data: string): ReviewResult => {
//   const result: ReviewResult = {
//     parsed: false,
//     originData: data,
//     data: [],
//   };
//   try {
//     const object = JSON.parse(data);
//     if (
//       object['明确问题'] &&
//       Object.prototype.toString.call(object['明确问题']) === '[object Array]'
//     ) {
//       const problems = object['明确问题'];
//       result.data = problems.map((problem: never) => {
//         return {
//           index: problem['问题编号'],
//           type: problem['问题类型'],
//           code: problem['问题代码片段'],
//           description: problem['问题描述'],
//         };
//       });
//       result.parsed = true;
//     } else {
//       throw new Error('解析失败');
//     }
//   } catch (error) {
//     Logger.error('parseReviewResult error', error);
//   }
//   return result;
// };

// export const api_get_code_review_result = async (
//   reviewId: string,
// ): Promise<ReviewResult> => {
//   Logger.log('api_get_code_review_result start', reviewId);
//   const result = await request<string>({
//     url: '/kong/RdTestAiService/v1/chatgpt/question/review/result',
//     method: 'get',
//     params: {
//       taskId: reviewId,
//     },
//   });
//   Logger.log('api_get_code_review_result end', result);
//   return parseReviewResult(result);
// };

// export const api_feedback_review = async (
//   reviewId: string,
//   userId: string,
//   feedback: Feedback,
//   timestamp: number,
//   comment: string,
// ) => {
//   return request({
//     url: '/kong/RdTestAiService/v1/chatgpt/question/review/feedback',
//     method: 'post',
//     data: {
//       id: reviewId,
//       userId,
//       feedback: feedback === Feedback.Helpful ? 1 : 0,
//       timestamp,
//       comment,
//     },
//   });
// };

// export const api_stop_review = async (reviewId: string) => {
//   return request({
//     url: '/kong/RdTestAiService/v1/chatgpt/question/review/stop',
//     method: 'post',
//     params: {
//       taskId: reviewId,
//     },
//   });
// };

import {
  ReviewRequestParams,
  ReviewResult,
  Feedback,
  ReviewState,
} from 'shared/types/review';
import Logger from 'electron-log/main';
import { timeout } from 'main/utils/common';

export const api_code_review = async (data: ReviewRequestParams) => {
  console.log('api_code_review', data);
  await timeout(150);
  return Math.random() + '';
};

export const api_get_code_review_state = async (reviewId: string) => {
  console.log('api_get_code_review_state', reviewId);
  await timeout(150);
  return ReviewState.Error;
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

export const api_get_code_review_result = async (reviewId: string) => {
  console.log('api_get_code_review_result', reviewId);
  await timeout(150);
  const data = `{
    "明确问题": [
        {
            "问题编号": 2,
            "问题类型": "内存越界",
            "问题代码片段": "memcpy(szPktBuf + ulHeadLen, szPktBufTmp, (ULONG)uiContentLen);",
            "问题描述": "在使用memcpy()函数时，需要确保目标缓冲区szPktBuf有足够的空间来容纳源缓冲区szPktBufTmp的内容，否则可能会导致内存越界。建议增加边界检查。"
        },
        {
            "问题编号": 2,
            "问题类型": "内存越界",
            "问题代码片段": "memcpy(szPktBuf + ulHeadLen, szPktBufTmp, (ULONG)uiContentLen);",
            "问题描述": "在使用memcpy()函数时，需要确保目标缓冲区szPktBuf有足够的空间来容纳源缓冲区szPktBufTmp的内容，否则可能会导致内存越界。建议增加边界检查。"
        }
    ]
}`;
  return parseReviewResult(data);
};

export const api_feedback_review = async (
  reviewId: string,
  userId: string,
  feedback: Feedback,
  timestamp: number,
  comment: string,
) => {
  console.log(
    'api_get_code_review_result',
    reviewId,
    userId,
    feedback,
    timestamp,
    comment,
  );
  await timeout(150);
  return '1111-2222-3333-4444';
};

export const api_stop_review = async (reviewId: string) => {
  console.log('api_get_code_review_result', reviewId);
  await timeout(150);
  return '1111-2222-3333-4444';
};
