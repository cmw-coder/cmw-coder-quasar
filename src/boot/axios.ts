import { boot } from 'quasar/wrappers';
import axios, { AxiosResponse } from 'axios';

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

const rdTestServiceProxy = axios.create({
  baseURL: 'http://rdee.h3c.com/kong/RdTestServiceProxy-e',
});

export const authCode = async (userId: string) => {
  return await rdTestServiceProxy.get('/EpWeChatLogin/authCode', {
    params: {
      operation: 'AI',
      userId,
    },
  });
};

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

export const loginWithCode = async (userId: string, code: string) => {
  return await rdTestServiceProxy.get<LoginData>('/EpWeChatLogin/login', {
    params: {
      code,
      userId,
    },
  });
};

export const chatWithHuggingFace = async (
  endpoint: string,
  question: string,
  historyList: { role: 'assistant' | 'user'; content: string }[],
) => {
  let history = '';
  for (const item of historyList) {
    history +=
      item.role === 'assistant'
        ? `### Instruction: \n${item.content}\n`
        : `### Response: \n${item.content}\n<|EOT|>\n`;
  }
  return await axios
    .create({
      baseURL: endpoint,
    })
    .post('/generate', {
      inputs:
        'You are an AI programming assistant, utilizing the DeepSeek Coder model, ' +
        'developed by DeepSeek Company, and you only answer questions related to computer science. ' +
        'For politically sensitive questions, security and privacy issues, ' +
        'and other non-computer science questions, you will refuse to answer.\n' +
        `${history}### Instruction: \n${question}\n### Response: \n`,
      parameters: {
        best_of: 1,
        details: true,
        do_sample: true,
        max_new_tokens: 256,
        repetition_penalty: 1.0,
        return_full_text: false,
        seed: null,
        stop: ['<｜end▁of▁sentence｜>', '<|EOT|>'],
        temperature: 0.2,
        top_p: 0.9,
        truncate: null,
        watermark: false,
      },
    });
};

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
