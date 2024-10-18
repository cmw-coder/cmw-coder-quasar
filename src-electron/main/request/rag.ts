import request from 'main/request';
import {
  MAX_RAG_CODE_QUERY_TIME,
  MAX_RAG_FUNCTION_DECLARATION_QUERY_TIME,
} from 'main/components/PromptExtractor/constants';
import completionLog from 'main/components/Loggers/completionLog';

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
    return {
      output: result.output.splice(0, 2),
    };
  } catch (e) {
    completionLog.error('apiRagCode.error', e);
    return {
      output: [],
    };
  }
};

export const apiRagFunctionDeclaration = async (identifiers: string[]) => {
  if (!identifiers.length) {
    completionLog.debug('apiRagFunctionDeclaration.identifiers.empty');
    return [];
  }
  completionLog.debug('apiRagFunctionDeclaration.identifiers', identifiers);
  const startTime = Date.now();
  try {
    const { output } = await request<RagFunctionDeclaration>({
      url: '/kong/RdTestAiService/v1/chatgpt/question/rag/function-declarations',
      method: 'post',
      data: {
        identifiers,
      },
      timeout: MAX_RAG_FUNCTION_DECLARATION_QUERY_TIME,
    });
    completionLog.debug(
      'apiRagFunctionDeclaration.success',
      Date.now() - startTime,
    );
    return output;
  } catch (e) {
    completionLog.error('apiRagFunctionDeclaration.error', e);
    return [];
  }
};
