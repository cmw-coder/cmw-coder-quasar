import request from 'main/request';
import { QuestionTemplateFile } from 'shared/types/QuestionTemplate';

// 获取产品线下的模板文件内容
export const api_getProductLineQuestionTemplateFile = (productLine: string) =>
  request<QuestionTemplateFile>({
    url: '/kong/RdTestAiService/template',
    method: 'get',
    params: {
      productLine,
    },
  });

// 代码采集
export const api_collection_code = async (data: {
  question: string;
  acceptCodes: string;
  afterEditCodes: string;
}) => {
  try {
    await request<boolean>({
      url: '/kong/RdTestAiService/chatgpt/collection',
      method: 'post',
      data,
    });
  } catch (e) {
    console.log('上报收集失败', e);
  }
};

// 获取用户支持的模板
export const api_getUserTemplateList = (account: string) =>
  request<string[]>({
    url: `/kong/RdTestAiService-b/template/lib/config?userId=${account}`,
    method: 'get',
  });

// 判断区域
export const api_checkAuthCode = () =>
  request<boolean>({
    url: '/kong/RdTestAiService-b/auth/judgement',
    method: 'get',
  });
