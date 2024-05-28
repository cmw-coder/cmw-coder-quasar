import { userInfo } from 'os';

import { LinseerStoreType } from 'main/stores/config/types';
import { ApiStyle, LinseerModelType, SubModelType } from 'shared/types/model';

export const linseerConfigDefault: LinseerStoreType = {
  apiStyle: ApiStyle.Linseer,
  config: {
    endpoints: {
      aiService: 'http://rdee.h3c.com/kong/RdTestAiService',
      statistics: 'http://rdee.h3c.com/kong/RdTestResourceStatistic',
      update: 'http://rdee.h3c.com/h3c-ai-assistant/plugin/sourceinsight',
    },
    modelConfigs: [
      {
        endpoint: 'http://rdee.h3c.com/kong/RdTestAiService/chatgpt',
        modelType: LinseerModelType.Linseer,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            maxTokenCount: 320,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
            subModelType: SubModelType['linseer-code-multi-line'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            maxTokenCount: 15,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>'],
            subModelType: SubModelType['linseer-code-single-line'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            maxTokenCount: 40,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '}'],
            subModelType: SubModelType['linseer-code-multi-line'],
            suggestionCount: 1,
            temperature: 0.2,
          },
        },
        separateTokens: {
          end: '<｜fim▁end｜>',
          middle: '<｜fim▁hole｜>',
          start: '<｜fim▁begin｜>',
        },
      },
      {
        endpoint: 'http://rdee.h3c.com/kong/RdTestAiService/chatgpt',
        modelType: LinseerModelType.Linseer_SR88Driver,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            maxTokenCount: 320,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
            subModelType: SubModelType['linseer-code-13b-sr88drv'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            maxTokenCount: 15,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>'],
            subModelType: SubModelType['linseer-code-13b-sr88drv'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            maxTokenCount: 40,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '}'],
            subModelType: SubModelType['linseer-code-13b-sr88drv'],
            suggestionCount: 1,
            temperature: 0.2,
          },
        },
        separateTokens: {
          end: '<｜fim▁end｜>',
          middle: '<｜fim▁hole｜>',
          start: '<｜fim▁begin｜>',
        },
      },
      {
        endpoint: 'http://rdee.h3c.com/kong/RdTestAiService/chatgpt',
        modelType: LinseerModelType.Linseer_CClsw,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            maxTokenCount: 320,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
            subModelType: SubModelType['linseer-code-13b-cclsw'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            maxTokenCount: 15,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>'],
            subModelType: SubModelType['linseer-code-13b-cclsw'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            maxTokenCount: 40,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '}'],
            subModelType: SubModelType['linseer-code-13b-cclsw'],
            suggestionCount: 1,
            temperature: 0.2,
          },
        },
        separateTokens: {
          end: '<｜fim▁end｜>',
          middle: '<｜fim▁hole｜>',
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
    modelType: LinseerModelType.Linseer,
    tokens: {
      access: '',
      refresh: '',
    },
  },
};
