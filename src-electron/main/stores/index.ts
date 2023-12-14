import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { HuggingFaceDataStore, LinseerDataStore } from 'main/stores/data';
import { ApiStyle } from 'main/types/model';

let apiStyle: ApiStyle;

// eslint-disable-next-line prefer-const
apiStyle = ApiStyle.HuggingFace;

export const configStore =
  apiStyle == ApiStyle.HuggingFace
    ? new HuggingFaceConfigStore()
    : new LinseerConfigStore();

export const dataStore =
  apiStyle == ApiStyle.HuggingFace
    ? new HuggingFaceDataStore()
    : new LinseerDataStore();
