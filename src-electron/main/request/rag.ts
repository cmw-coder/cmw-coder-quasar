import request from 'main/request';
import axios from 'axios';

export interface RagCode {
  similarCode: string;
  functionName: string;
  filePath: string;
  similarScore: number;
}

export enum ResolveReason {
  DONE = 'DONE',
  TIMEOUT = 'TIMEOUT',
}

export const api_code_rag2 = async (input: string) => {
  return request<{
    output: RagCode[];
  }>({
    url: '/kong/RdTestAiService/v1/chatgpt/question/rag',
    method: 'post',
    data: {
      input,
    },
  });
};

export const api_code_rag = async (input: string) => {
  const data = await axios<{
    output: RagCode[];
  }>({
    url: 'http://10.113.36.121/code_search/invoke',
    method: 'post',
    data: {
      input,
    },
  });
  return data.data;
};
