import { Schema } from 'electron-store';

import {
  DataProjectType,
  DataStoreType,
  DataWindowType,
} from 'main/stores/data/types';

const dataProjectSchema: Schema<DataProjectType> = {
  pathAndIdMapping: {
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  },
};

const dataWindowSchema: Schema<DataWindowType> = {
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
  zoom: {
    type: 'number',
  },
};

export const dataStoreSchema: Schema<DataStoreType> = {
  project: {
    type: 'object',
    required: Object.keys(dataProjectSchema),
    additionalProperties: false,
    properties: dataProjectSchema,
  },
  window: {
    type: 'object',
    required: Object.keys(dataWindowSchema),
    additionalProperties: false,
    properties: dataWindowSchema,
  },
};
