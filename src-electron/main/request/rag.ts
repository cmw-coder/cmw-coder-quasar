import request from 'main/request';
import axios from 'axios';
import Logger from 'electron-log';
import { MAX_RAG_CODE_QUERY_TIME } from 'main/components/PromptExtractor/constants';

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

export const api_code_rag = async (input: string) => {
  const startTime = Date.now();
  try {
    const result = await request<{
      output: RagCode[];
    }>({
      url: '/kong/RdTestAiService/v1/chatgpt/question/rag',
      method: 'post',
      data: {
        input,
      },
      timeout: MAX_RAG_CODE_QUERY_TIME,
    });
    Logger.debug('api_code_rag.success', Date.now() - startTime);
    return result;
  } catch (e) {
    Logger.error('api_code_rag.error', e);
    return {
      output: [],
    };
  }
};

export const api_code_rag2 = async (input: string) => {
  const startTime = Date.now();
  try {
    const data = await axios<{
      output: RagCode[];
    }>({
      url: 'http://10.113.36.121:9306/code_search/invoke',
      method: 'post',
      data: {
        input,
      },
      timeout: MAX_RAG_CODE_QUERY_TIME,
    });
    Logger.debug('api_code_rag.success', Date.now() - startTime);
    return data.data;
  } catch (e) {
    Logger.error('api_code_rag.error', e);
    return {
      output: [],
    };
  }
};
