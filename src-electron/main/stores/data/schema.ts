import { Schema } from 'electron-store';

import { DataStoreType, DataWindowType } from 'main/stores/data/types';

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
  window: {
    type: 'object',
    required: Object.keys(dataWindowSchema),
    additionalProperties: false,
    properties: dataWindowSchema,
  },
};
