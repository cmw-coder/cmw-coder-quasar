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
} from 'shared/types/model';

export const huggingFaceStoreDefaultNormal: HuggingFaceStoreType = {
  apiStyle: ApiStyle.HuggingFace,
  config: {
    endpoints: {
      aiService: 'http://10.113.36.121/kong/RdTestAiService',
      statistics: 'http://10.113.36.121/kong/RdTestResourceStatistic',
      update: 'http://10.113.36.121/h3c-ai-assistant/cmw-coder',
    },
    modelConfigs: [
      {
        modelType: HuggingFaceModelType.ComwareV1,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            endpoint: 'http://10.113.36.104',
            maxTokenCount: 1024,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\n}'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            endpoint: 'http://10.113.36.104',
            maxTokenCount: 64,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\r\n', '\n'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            endpoint: 'http://10.113.36.104',
            maxTokenCount: 96,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '}'],
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
  },
  data: {
    modelType: HuggingFaceModelType.ComwareV1,
  },
};

export const huggingFaceStoreDefaultRoute: HuggingFaceStoreType = {
  apiStyle: ApiStyle.HuggingFace,
  config: {
    endpoints: {
      aiService: 'http://10.113.12.206/kong/RdTestAiService',
      statistics: 'http://10.113.12.206/kong/RdTestResourceStatistic',
      update: 'http://10.113.12.206/h3c-ai-assistant/cmw-coder',
    },
    modelConfigs: [
      {
        modelType: HuggingFaceModelType.ComwareV1,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            endpoint: 'http://10.113.12.206:9190',
            maxTokenCount: 1024,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\n}'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            endpoint: 'http://10.113.12.206:9190',
            maxTokenCount: 64,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\r\n', '\n'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            endpoint: 'http://10.113.12.206:9190',
            maxTokenCount: 96,
            stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '}'],
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
  },
  data: {
    modelType: HuggingFaceModelType.ComwareV1,
  },
};

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

export const linseerConfigDefaultBeta: LinseerStoreType = {
  apiStyle: ApiStyle.Linseer,
  config: {
    endpoints: {
      aiService: 'http://10.113.36.121/kong/RdTestAiService',
      statistics: 'http://10.113.36.121/kong/RdTestResourceStatistic',
      update: 'http://10.113.36.121/h3c-ai-assistant/plugin/sourceinsight',
    },
    modelConfigs: [
      {
        endpoint: 'http://10.113.36.121/kong/RdTestAiService/chatgpt',
        modelType: LinseerModelType.Linseer_Beta,
        completionConfigs: {
          function: {
            contextLimit: 1500,
            maxTokenCount: 320,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '\n}'],
            subModelType: SubModelType['CmwCoderV1'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          line: {
            contextLimit: 1500,
            maxTokenCount: 15,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>'],
            subModelType: SubModelType['CmwCoderV1'],
            suggestionCount: 1,
            temperature: 0.2,
          },
          snippet: {
            contextLimit: 1500,
            maxTokenCount: 40,
            stopTokens: ['<fim_pad>', '<|endoftext|>', '</s>', '}'],
            subModelType: SubModelType['CmwCoderV1'],
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
