import { userInfo } from 'os';

import {
  HuggingFaceConfigType,
  LinseerConfigType,
} from 'main/stores/config/types';
import {
  ApiStyle,
  HuggingFaceModelType,
  LinseerModelType,
  SubModelType,
} from 'main/types/model';

export const defaultHuggingFaceConfig: HuggingFaceConfigType = {
  apiStyle: ApiStyle.HuggingFace,
  statistics: 'http://10.113.36.121/kong/RdTestResourceStatistic',
  modelConfigs: [
    {
      modelType: HuggingFaceModelType.ComwareV1,
      completionConfigs: {
        function: {
          contextLimit: 1500,
          endpoint: 'http://10.113.36.104',
          maxTokenCount: 256,
          stopTokens: ['<fim_pad>', '<|endoftext|>', '\n}'],
          suggestionCount: 1,
          temperature: 0.2,
        },
        line: {
          contextLimit: 1500,
          endpoint: 'http://10.113.36.111:8080',
          maxTokenCount: 48,
          stopTokens: ['<fim_pad>', '<|endoftext|>', '\n}'],
          suggestionCount: 1,
          temperature: 0.2,
        },
        snippet: {
          contextLimit: 1500,
          endpoint: 'http://10.113.36.104',
          maxTokenCount: 128,
          stopTokens: ['<fim_pad>', '<|endoftext|>', '\n}'],
          suggestionCount: 1,
          temperature: 0.2,
        },
      },
      separateTokens: {
        end: '<fim_suffix>',
        middle: '<fim_middle>',
        start: '<fim_prefix>',
      },
    },
  ],
  server: {
    host: 'localhost',
    port: 3000,
  },
  userId: userInfo().username,
};

export const defaultLinseerConfig: LinseerConfigType = {
  apiStyle: ApiStyle.Linseer,
  statistics: 'http://rdee.h3c.com/kong/RdTestResourceStatistic',
  modelConfigs: [
    {
      endpoint: 'http://rdee.h3c.com/kong/RdTestAiService/chatgpt',
      modelType: LinseerModelType.Linseer,
      completionConfigs: {
        function: {
          contextLimit: 1500,
          maxTokenCount: 256,
          stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
          subModelType: SubModelType['linseer-code-34b'],
          suggestionCount: 1,
          temperature: 0.2,
        },
        line: {
          contextLimit: 1500,
          maxTokenCount: 48,
          stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
          subModelType: SubModelType['linseer-code-13b'],
          suggestionCount: 1,
          temperature: 0.2,
        },
        snippet: {
          contextLimit: 1500,
          maxTokenCount: 128,
          stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
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
};
