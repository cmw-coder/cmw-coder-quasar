import request from 'main/request';

export interface RagCode {
  similarCode: string;
  functionName: string;
  filePath: string;
  similarScore: number;
}

export const api_code_rag = async (input: string) => {
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
