import { release } from 'os';

import { DataStoreType } from 'main/stores/data/types';

export const dataStoreDefault: DataStoreType = {
  compatibility: {
    transparentFallback: parseInt(release().split('.')[0]) < 10,
    zoomFix: false,
  },
  project: {},
  window: {
    main: {
      height: 1120,
      show: true,
      width: 630,
    },
  },
};
