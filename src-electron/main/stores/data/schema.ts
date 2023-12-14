import { Schema } from 'electron-store';

import { HuggingFaceDataType, LinseerDataType } from 'main/stores/data/types';
import { HuggingFaceModelType, LinseerModelType } from 'main/types/model';

export const huggingFaceDataSchema: Schema<HuggingFaceDataType> = {
  modelType: {
    type: 'string',
    enum: Object.keys(HuggingFaceModelType),
  },
};

export const linseerDataSchema: Schema<LinseerDataType> = {
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
