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
  description: string,
  userId: string,
  version: string,
  pictures?: string[]
) => {
  return await axios
    .create({
      baseURL: endpoint,
    })
    .post<string>('/chatgpt/feedback', {
      description,
      userId,
      version,
      pictures,
    });
};

export const loginWithCode = async (userId: string, code: string) => {
  return await rdTestServiceProxy.get<LoginData>('/EpWeChatLogin/login', {
    params: {
      code,
      userId,
    },
  });
};

// noinspection JSUnusedGlobalSymbols
export default boot(({ app }) => {
  app.config.globalProperties.$authCode = authCode;
  app.config.globalProperties.$login = loginWithCode;
});
