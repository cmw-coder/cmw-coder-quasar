import Logger from 'electron-log/main';
import request from 'main/request';
import { timeout } from 'main/utils/common';

export const api_code_rag2 = async (input: string) => {
  Logger.log('api_code_rag');
  const result = await request<{
    output: {
      similarCode: string;
      functionName: string;
      filePath: string;
      similarScore: number;
    }[];
  }>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/rag',
    method: 'post',
    data: {
      input,
    },
  });
  Logger.log('api_code_rag', result);
  return result;
};

export const api_code_rag = async (input: string) => {
  console.log('api_code_rag', input);
  await timeout(1000);
  return {
    output: [
      {
        similarCode: 'console.log("hello world")',
        functionName: 'console.log',
        filePath: 'index.js',
        similarScore: 0.9,
      },
      {
        similarCode: 'console.log("hello world")',
        functionName: 'console.log',
        filePath: 'index2.js',
        similarScore: 0.9,
      },
    ],
  };
};
