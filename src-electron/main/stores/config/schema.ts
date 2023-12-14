import { Schema } from 'electron-store';
import { userInfo } from 'os';

import {
  CommonConfigType,
  HuggingFaceCompletionConfigType,
  HuggingFaceConfigType,
  HuggingFaceModelConfigType,
  LinseerCompletionConfigType,
  LinseerConfigType,
  LinseerModelConfigType,
} from 'main/stores/config/types';
import {
  ApiStyle,
  HuggingFaceModelType,
  LinseerModelType,
  SubModelType,
} from 'main/types/model';

const commonConfigSchema: Schema<CommonConfigType> = {
  server: {
    type: 'object',
    required: ['host', 'port'],
    additionalProperties: false,
    properties: {
      host: {
        type: 'string',
      },
      port: {
        type: 'number',
      },
    },
  },
  statistics: {
    type: 'string',
  },
  userId: {
    type: 'string',
    default: userInfo().username,
  },
};

const huggingFaceCompletionConfigSchema: Schema<HuggingFaceCompletionConfigType> =
  {
    contextLimit: {
      type: 'number',
    },
    endpoint: {
      type: 'string',
    },
    maxTokenCount: {
      type: 'number',
    },
    stopTokens: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    suggestionCount: {
      type: 'number',
    },
    temperature: {
      type: 'number',
    },
  };

const huggingFaceModelConfigSchema: Schema<HuggingFaceModelConfigType> = {
  completionConfigs: {
    type: 'object',
    required: ['function', 'line', 'snippet'],
    additionalProperties: false,
    properties: {
      function: {
        type: 'object',
        required: Object.keys(huggingFaceCompletionConfigSchema),
        properties: huggingFaceCompletionConfigSchema,
      },
      line: {
        type: 'object',
        required: Object.keys(huggingFaceCompletionConfigSchema),
        properties: huggingFaceCompletionConfigSchema,
      },
      snippet: {
        type: 'object',
        required: Object.keys(huggingFaceCompletionConfigSchema),
        properties: huggingFaceCompletionConfigSchema,
      },
    },
  },
  modelType: {
    type: 'string',
    enum: Object.keys(HuggingFaceModelType),
  },
  separateTokens: {
    type: 'object',
    required: ['end', 'middle', 'start'],
    properties: {
      end: {
        type: 'string',
      },
      middle: {
        type: 'string',
      },
      start: {
        type: 'string',
      },
    },
  },
};

export const huggingFaceConfigSchema: Schema<HuggingFaceConfigType> = {
  ...commonConfigSchema,
  apiStyle: {
    type: 'string',
    enum: [ApiStyle.HuggingFace],
  },
  modelConfigs: {
    type: 'array',
    items: {
      type: 'object',
      properties: huggingFaceModelConfigSchema,
    },
  },
};

const linseerCompletionConfigSchema: Schema<LinseerCompletionConfigType> = {
  contextLimit: {
    type: 'number',
  },
  maxTokenCount: {
    type: 'number',
  },
  stopTokens: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
  subModelType: {
    type: 'string',
    enum: Object.keys(SubModelType),
  },
  suggestionCount: {
    type: 'number',
  },
  temperature: {
    type: 'number',
  },
};

const linseerModelConfigSchema: Schema<LinseerModelConfigType> = {
  completionConfigs: {
    type: 'object',
    required: ['function', 'line', 'snippet'],
    additionalProperties: false,
    properties: {
      function: {
        type: 'object',
        required: Object.keys(linseerCompletionConfigSchema),
        properties: linseerCompletionConfigSchema,
      },
      line: {
        type: 'object',
        required: Object.keys(linseerCompletionConfigSchema),
        properties: linseerCompletionConfigSchema,
      },
      snippet: {
        type: 'object',
        required: Object.keys(linseerCompletionConfigSchema),
        properties: linseerCompletionConfigSchema,
      },
    },
  },
  endpoint: {
    type: 'string',
  },
  modelType: {
    type: 'string',
    enum: Object.keys(LinseerModelType),
  },
};

/**
 * See {@link LinseerConfigType}
 */
export const linseerConfigSchema: Schema<LinseerConfigType> = {
  ...commonConfigSchema,
  apiStyle: {
    type: 'string',
    enum: [ApiStyle.Linseer],
  },
  modelConfigs: {
    type: 'array',
    items: {
      type: 'object',
      properties: linseerModelConfigSchema,
    },
  },
};
