import request from 'src/request';

export const api_refreshToken = (refreshToken: string) =>
  request<{
    refresh_token: string;
    access_token: string;
    token_type: string;
    expires_in: number;
  }>({
    url: '/kong/RdTestLoginService/api/token/refresh',
    method: 'post',
    params: {
      refreshToken,
    },
  });

export const api_getAuthCode = (username: string) =>
  request<string>({
    url: '/kong/RdTestServiceProxy-e/EpWeChatLogin/authCode',
    method: 'get',
    params: {
      userId: username,
      operation: 'AI',
    },
  });

export interface TokenRes {
  userId: string;
  token: string;
  refreshToken: string;
  error: string;
}

export const api_checkAuthCode = (username: string, code: string) =>
  request<TokenRes>({
    url: '/kong/RdTestServiceProxy-e/EpWeChatLogin/login',
    method: 'get',
    params: {
      userId: username,
      code,
    },
  });
