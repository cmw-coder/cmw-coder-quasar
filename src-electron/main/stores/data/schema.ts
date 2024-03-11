import { Schema } from 'electron-store';

import {
  DataProjectType,
  DataStoreType,
  DataWindowType,
} from 'main/stores/data/types';

const dataProjectSchema: Schema<DataProjectType> = {
  id: {
    type: 'string',
  },
  lastAddedLines: {
    type: 'number',
  },
  svn: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
        },
        revision: {
          type: 'number',
        },
      },
    },
  },
};

const dataWindowSchema: Schema<DataWindowType> = {
  dipMapping: {
    type: 'boolean',
  },
  main: {
    type: 'object',
    required: ['height', 'show', 'width'],
    additionalProperties: false,
    properties: {
      height: {
        type: 'number',
      },
      show: {
        type: 'boolean',
      },
      width: {
        type: 'number',
      },
    },
  },
};

export const dataStoreSchema: Schema<DataStoreType> = {
  project: {
    type: 'object',
    additionalProperties: {
      type: 'object',
      required: Object.keys(dataProjectSchema),
      additionalProperties: false,
      properties: dataProjectSchema,
    },
  },
  window: {
    type: 'object',
    required: Object.keys(dataWindowSchema),
    additionalProperties: false,
    properties: dataWindowSchema,
  },
};
