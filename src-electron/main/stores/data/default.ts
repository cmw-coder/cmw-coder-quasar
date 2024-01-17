import { DataStoreType } from 'main/stores/data/types';

export const dataStoreDefault: DataStoreType = {
  project: {
    pathAndIdMapping: {},
  },
  window: {
    main: {
      height: 1120,
      show: true,
      width: 630,
    },
    zoom: 1.0,
  },
};
