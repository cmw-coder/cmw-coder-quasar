import {
  ReviewResult,
  ReviewState,
  reviewRequestParams,
} from 'shared/types/review';
import Logger from 'electron-log/main';
import { timeout } from 'main/utils/common';

export const api_code_review = async (data: reviewRequestParams) => {
  console.log('api_code_review', data);
  await timeout(150);
  return '1111-2222-3333-4444';
};

export const api_get_code_review_state = async (reviewId: string) => {
  console.log('api_get_code_review_state', reviewId);
  await timeout(150);
  return ReviewState.Third;
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
