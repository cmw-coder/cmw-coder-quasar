import { HuggingFaceDataType, LinseerDataType } from 'main/stores/data/types';
import {
  ApiStyle,
  HuggingFaceModelType,
  LinseerModelType,
} from 'main/types/model';

export const defaultHuggingFaceData: HuggingFaceDataType = {
  apiStyle: ApiStyle.HuggingFace,
  modelType: HuggingFaceModelType.ComwareV1,
};

export const defaultLinseerData: LinseerDataType = {
  apiStyle: ApiStyle.Linseer,
  modelType: LinseerModelType.Linseer,
  tokens: {
    access: '',
    refresh: '',
  },
};
