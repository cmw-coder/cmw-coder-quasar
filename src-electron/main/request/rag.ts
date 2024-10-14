import request from 'main/request';
import {
  MAX_RAG_CODE_QUERY_TIME,
  MAX_RAG_FUNCTION_DECLARATION_QUERY_TIME
} from 'main/components/PromptExtractor/constants';
import completionLog from 'main/components/Loggers/completionLog';

export interface RagCode {
  similarCode: string;
  functionName: string;
  filePath: string;
  similarScore: number;
}

export interface RagFunctionDeclaration {
  input: string;
  output: {
    content: string;
    path: string;
  }[];
}

export enum ResolveReason {
  DONE = 'DONE',
  TIMEOUT = 'TIMEOUT',
}

export const apiRagCode = async (input: string) => {
  if (!input.length) {
    completionLog.debug('apiRagCode.input.empty');
    return {
      output: [],
    };
  }
  completionLog.debug(
    'apiRagCode.input',
    input,
  );
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
    completionLog.debug('apiRagCode.success', Date.now() - startTime);
    return result;
  } catch (e) {
    completionLog.error('apiRagCode.error', e);
    return {
      output: [],
    };
  }
};

export const apiRagFunctionDeclaration = async (input: string) => {
  if (!input.length) {
    completionLog.debug('apiRagFunctionDeclaration.input.empty');
    return [];
  }
  completionLog.debug(
    'apiRagFunctionDeclaration.input',
    input,
  );
  const startTime = Date.now();
  try {
    const result = await request<RagFunctionDeclaration[]>({
      url: '/kong/RdTestAiService/v1/chatgpt/question/rag/function-declarations',
      method: 'post',
      data: {
        input,
      },
      timeout: MAX_RAG_FUNCTION_DECLARATION_QUERY_TIME,
    });
    completionLog.debug('apiRagFunctionDeclaration.success', Date.now() - startTime);
    return result;
  } catch (e) {
    completionLog.error('apiRagFunctionDeclaration.error', e);
    return [];
  }
};
