import axios, { AxiosResponse } from 'axios';
import { boot } from 'quasar/wrappers';

import { StepInfo } from 'stores/workflow/types';

declare module '@vue/runtime-core' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $authCode: (userId: string) => Promise<AxiosResponse>;
    $login: (userId: string, code: string) => Promise<AxiosResponse<LoginData>>;
  }
}

type LoginData =
  | {
      userId: null;
      token: null;
      refreshToken: null;
      error: string;
    }
  | {
      userId: string;
      token: string;
      refreshToken: string;
      error: null;
    };

interface LangChainDataResponse {
  event: 'data';
  data: {
    messages: {
      content: StepInfo[];
    }[];
  };
}

interface LangChainMetadataResponse {
  event: 'metadata';
  data: string;
}

type LangChainResponse = LangChainDataResponse | LangChainMetadataResponse;

const rdTestServiceProxy = axios.create({
  baseURL: 'http://rdee.h3c.com/kong/RdTestServiceProxy-e',
});

// noinspection JSUnusedGlobalSymbols
export const agentStream = async (
  input: string,
  progressCallback?: (response: { id: string; data: StepInfo[] }) => void,
) =>
  axios.create({ baseURL: 'http://10.113.36.127:9299' }).post(
    '/agent/stream',
    {
      config: {
        metadata: {},
        recursionLimit: 25,
        tags: [],
      },
      input: {
        input: input,
      },
      kwargs: {},
    },
    {
      onDownloadProgress: ({ event }) => {
        if (progressCallback) {
          const result: { id: string; data: StepInfo[] } = { id: '', data: [] };
          const processed = (<XMLHttpRequest>event.target).responseText
            .split(/\r?\n\r?\n/)
            .filter((item) => item.length)
            .map((item) => item.split(/\r?\n/))
            .filter((list) => list.length === 2)
            .map(
              ([event, data]) =>
                <LangChainResponse>{
                  event: event.split('event: ')[1],
                  data: Object.values(JSON.parse(data.split('data: ')[1]))[0],
                },
            )
            .filter(({ event, data }) => event?.length && data)
            .filter(({ data }) => typeof data === 'string' || data);
          for (const { event, data } of processed) {
            if (event === 'metadata') {
              result.id = data;
            } else if (data.messages.length === 1) {
              result.data.push(data.messages[0].content[0]);
            }
          }
          progressCallback(result);
        }
      },
    },
  );

/**
 * @deprecated
 */
export const authCode = async (userId: string) => {
  return await rdTestServiceProxy.get('/EpWeChatLogin/authCode', {
    params: {
      operation: 'AI',
      userId,
    },
  });
};

/**
 * @deprecated
 */
export const feedBack = async (
  endpoint: string,
  accessToken: string,
  description: string,
  userId: string,
  version: string,
  pictures?: string[],
) => {
  return await axios
    .create({
      baseURL: endpoint,
    })
    .post<string>(
      '/chatgpt/feedback',
      {
        description,
        userId,
        version,
        pictures,
      },
      {
        headers: {
          'x-authorization': `bearer ${accessToken}`,
        },
      },
    );
};

/**
 * @deprecated
 */
export const loginWithCode = async (userId: string, code: string) => {
  return await rdTestServiceProxy.get<LoginData>('/EpWeChatLogin/login', {
    params: {
      code,
      userId,
    },
  });
};

/**
 * @deprecated
 */
// noinspection JSUnusedGlobalSymbols
export const chatWithDeepSeek = async (
  endpoint: string,
  question: string,
  historyList: { role: 'assistant' | 'user'; content: string }[],
  progressCallback?: (content: string) => void,
) =>
  await axios
    .create({
      baseURL: endpoint,
    })
    .post<{
      choices: {
        message: {
          role: 'assistant' | 'user';
          content: string;
        };
      }[];
    }>(
      '/v1/chat/completions',
      {
        details: false,
        max_tokens: 2048,
        messages: [
          ...historyList,
          {
            role: 'user',
            content: question,
          },
        ],
        model: 'deepseek-ai/deepseek-llm-7b-chat',
        seed: 42,
        stop: ['<｜end▁of▁sentence｜>'],
        stream: true,
        temperature: 0.5,
      },
      {
        onDownloadProgress: (progressEvent) => {
          progressCallback?.(progressEvent.event.target.responseText);
        },
      },
    );

/**
 * @deprecated
 */
// noinspection JSUnusedGlobalSymbols
export const chatWithLinseer = async (
  endpoint: string,
  question: string,
  historyList: { role: 'assistant' | 'user'; content: string }[],
  accessToken: string,
  progressCallback?: (content: string) => void,
) =>
  await axios
    .create({
      baseURL: endpoint,
    })
    .post(
      progressCallback ? '/chatgpt/question/stream' : '/chatgpt/question',
      {
        question,
        model: 'chatgpt_3.5_16k',
        temperature: 1,
        multiChat: true,
        historyList,
        plugin: 'SI',
        templateName: 'Chat',
        profileModel: 'OPEN-AI公有云模型',
        subType: 'Temp',
      },
      {
        headers: {
          'x-authorization': `bearer ${accessToken}`,
        },
        onDownloadProgress: (progressEvent) => {
          progressCallback?.(progressEvent.event.target.responseText);
        },
      },
    );

// noinspection JSUnusedGlobalSymbols
export default boot(({ app }) => {
  app.config.globalProperties.$authCode = authCode;
  app.config.globalProperties.$login = loginWithCode;
});
