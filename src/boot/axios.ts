import axios, { AxiosResponse } from 'axios';

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
