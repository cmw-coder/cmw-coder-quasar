import { Schema } from 'electron-store';
import { userInfo } from 'os';

import {
  CommonConfigType,
  HuggingFaceCompletionConfigType,
  HuggingFaceConfigType,
  HuggingFaceDataType,
  HuggingFaceModelConfigType,
  HuggingFaceStoreType,
  LinseerCompletionConfigType,
  LinseerConfigType,
  LinseerDataType,
  LinseerModelConfigType,
  LinseerStoreType,
} from 'main/stores/config/types';
import {
  ApiStyle,
  HuggingFaceModelType,
  LinseerModelType,
  SubModelType,
} from 'shared/types/model';

const commonConfigSchema: Schema<CommonConfigType> = {
  endpoints: {
    type: 'object',
    required: ['feedback', 'statistics', 'update'],
    additionalProperties: false,
    properties: {
      feedback: {
        type: 'string',
      },
      statistics: {
        type: 'string',
      },
      update: {
        type: 'string',
      },
    },
  },
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
  userId: {
    type: 'string',
    default: userInfo().username,
  },
};

/// HuggingFace --------------------------------------------------------------------------------------------------------

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
        additionalProperties: false,
        properties: huggingFaceCompletionConfigSchema,
      },
      line: {
        type: 'object',
        required: Object.keys(huggingFaceCompletionConfigSchema),
        additionalProperties: false,
        properties: huggingFaceCompletionConfigSchema,
      },
      snippet: {
        type: 'object',
        required: Object.keys(huggingFaceCompletionConfigSchema),
        additionalProperties: false,
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
    additionalProperties: false,
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

const huggingFaceConfigSchema: Schema<HuggingFaceConfigType> = {
  ...commonConfigSchema,
  modelConfigs: {
    type: 'array',
    items: {
      type: 'object',
      required: Object.keys(huggingFaceModelConfigSchema),
      additionalProperties: false,
      properties: huggingFaceModelConfigSchema,
    },
  },
};

const huggingFaceDataSchema: Schema<HuggingFaceDataType> = {
  modelType: {
    type: 'string',
    enum: Object.keys(HuggingFaceModelType),
  },
};

export const huggingFaceStoreSchema: Schema<HuggingFaceStoreType> = {
  apiStyle: {
    type: 'string',
    const: ApiStyle.HuggingFace,
  },
  config: {
    type: 'object',
    required: Object.keys(huggingFaceConfigSchema),
    additionalProperties: false,
    properties: huggingFaceConfigSchema,
  },
  data: {
    type: 'object',
    required: Object.keys(huggingFaceDataSchema),
    additionalProperties: false,
    properties: huggingFaceDataSchema,
  },
};

/// Linseer ------------------------------------------------------------------------------------------------------------

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
        additionalProperties: false,
        properties: linseerCompletionConfigSchema,
      },
      line: {
        type: 'object',
        required: Object.keys(linseerCompletionConfigSchema),
        additionalProperties: false,
        properties: linseerCompletionConfigSchema,
      },
      snippet: {
        type: 'object',
        required: Object.keys(linseerCompletionConfigSchema),
        additionalProperties: false,
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
  separateTokens: {
    type: 'object',
    required: ['end', 'middle', 'start'],
    additionalProperties: false,
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

const linseerConfigSchema: Schema<LinseerConfigType> = {
  ...commonConfigSchema,
  modelConfigs: {
    type: 'array',
    items: {
      type: 'object',
      required: Object.keys(linseerModelConfigSchema),
      additionalProperties: false,
      properties: linseerModelConfigSchema,
    },
  },
};

const linseerDataSchema: Schema<LinseerDataType> = {
  modelType: {
    type: 'string',
    enum: Object.keys(LinseerModelType),
  },
  tokens: {
    type: 'object',
    required: ['access', 'refresh'],
    additionalProperties: false,
    properties: {
      access: {
        type: 'string',
      },
      refresh: {
        type: 'string',
      },
    },
  },
};

export const linseerStoreSchema: Schema<LinseerStoreType> = {
  apiStyle: {
    type: 'string',
    const: ApiStyle.Linseer,
  },
  config: {
    type: 'object',
    required: Object.keys(linseerConfigSchema),
    additionalProperties: false,
    properties: linseerConfigSchema,
  },
  data: {
    type: 'object',
    required: Object.keys(linseerDataSchema),
    additionalProperties: false,
    properties: linseerDataSchema,
  },
};
