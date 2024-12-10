import { release } from 'os';

import { DataStoreType } from 'main/stores/data/types';

/*
 * TODO: Remove this when the compatibility issue is resolved
 */
export const dataStoreDefault: DataStoreType = {
  compatibility: {
    transparentFallback: parseInt(release().split('.')[0]) < 10,
    zoomFix: false,
  },
  project: {},
  window: {
    main: {
      height: 1300,
      show: true,
      width: 780,
    },
  },
};
