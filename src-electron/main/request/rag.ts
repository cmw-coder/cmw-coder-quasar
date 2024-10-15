import request from 'main/request';
import {
  MAX_RAG_CODE_QUERY_TIME,
  MAX_RAG_FUNCTION_DECLARATION_QUERY_TIME,
} from 'main/components/PromptExtractor/constants';
import completionLog from 'main/components/Loggers/completionLog';
import axios from 'axios';

export interface RagCode {
  similarCode: string;
  functionName: string;
  filePath: string;
  similarScore: number;
}

export interface RagFunctionDeclaration {
  output: {
    functionName: string;
    functionDeclarations: {
      content: string;
      path: string;
    }[];
  }[];
}

export const apiRagCode = async (input: string) => {
  if (!input.length) {
    completionLog.debug('apiRagCode.input.empty');
    return {
      output: [],
    };
  }
  completionLog.debug('apiRagCode.input', input);
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
  completionLog.debug('apiRagFunctionDeclaration.input', input);
  const startTime = Date.now();
  try {
    // const result = await request<RagFunctionDeclaration[]>({
    //   url: '/kong/RdTestAiService/v1/chatgpt/question/rag/function-declarations',
    //   method: 'post',
    //   data: {
    //     input,
    //   },
    //   timeout: MAX_RAG_FUNCTION_DECLARATION_QUERY_TIME,
    // });
    const { data } = await axios.post<RagFunctionDeclaration>(
      'http://10.113.36.104:9306/func_name_declaration/invoke',
      {
        input,
      },
      {
        timeout: MAX_RAG_FUNCTION_DECLARATION_QUERY_TIME,
      },
    );
    completionLog.debug(
      'apiRagFunctionDeclaration.success',
      Date.now() - startTime,
    );
    return data.output;
  } catch (e) {
    completionLog.error('apiRagFunctionDeclaration.error', e);
    return [];
  }
};
