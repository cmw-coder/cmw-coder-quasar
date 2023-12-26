import { HuggingFaceConfigStore, LinseerConfigStore } from 'main/stores/config';
import { ApiStyle } from 'main/types/model';

let apiStyle: ApiStyle;

// eslint-disable-next-line prefer-const
apiStyle = ApiStyle.Linseer;

export const configStore =
  apiStyle === ApiStyle.HuggingFace
    ? new HuggingFaceConfigStore()
    : new LinseerConfigStore();
