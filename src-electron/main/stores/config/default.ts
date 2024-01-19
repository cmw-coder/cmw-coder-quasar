import { userInfo } from 'os';

import {
  HuggingFaceStoreType,
  LinseerStoreType,
} from 'main/stores/config/types';
import {
  ApiStyle,
  HuggingFaceModelType,
  LinseerModelType,
  SubModelType,
} from 'main/types/model';

export const huggingFaceStoreDefault: HuggingFaceStoreType = {
  apiStyle: ApiStyle.HuggingFace,
  config: {
    statistics: 'http://10.113.36.121/kong/RdTestResourceStatistic',
    modelConfigs: [
      {
        modelType: HuggingFaceModelType.ComwareV1,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            endpoint: 'http://10.113.36.127:9191',
            maxTokenCount: 512,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\n}'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            endpoint: 'http://10.113.36.127:9191',
            maxTokenCount: 64,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\r\n', '\n'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            endpoint: 'http://10.113.36.127:9191',
            maxTokenCount: 96,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '}'],
            suggestionCount: 1,
            temperature: 0.2,
          },
        },
        separateTokens: {
          end: '<｜fim▁hole｜>',
          middle: '<｜fim▁end｜>',
          start: '<｜fim▁begin｜>',
        },
      },
    ],
    server: {
      host: 'localhost',
      port: 3000,
    },
    userId: userInfo().username,
  },
  data: {
    modelType: HuggingFaceModelType.ComwareV1,
  },
};

export const linseerConfigDefault: LinseerStoreType = {
  apiStyle: ApiStyle.Linseer,
  config: {
    statistics: 'http://rdee.h3c.com/kong/RdTestResourceStatistic',
    modelConfigs: [
      {
        endpoint: 'http://rdee.h3c.com/kong/RdTestAiService/chatgpt',
        modelType: LinseerModelType.Linseer,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            maxTokenCount: 320,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
            subModelType: SubModelType['linseer-code-34b'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            maxTokenCount: 10,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>'],
            subModelType: SubModelType['linseer-code-13b'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            maxTokenCount: 40,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '}'],
            subModelType: SubModelType['linseer-code-34b'],
            suggestionCount: 1,
            temperature: 0.2,
          },
        },
      },
    ],
    server: {
      host: 'localhost',
      port: 3000,
    },
    userId: userInfo().username,
  },
  data: {
    modelType: LinseerModelType.Linseer,
    tokens: {
      access: '',
      refresh: '',
    },
  },
};
