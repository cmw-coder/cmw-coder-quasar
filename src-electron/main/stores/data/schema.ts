import { Schema } from 'electron-store';

import { DataProjectType, DataWindowType } from 'main/stores/data/types';

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
Object.keys(dataProjectSchema);
Object.keys(dataWindowSchema);
