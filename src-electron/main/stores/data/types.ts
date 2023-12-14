import { HuggingFaceModelType, LinseerModelType } from 'main/types/model';

export interface HuggingFaceDataType {
  modelType: HuggingFaceModelType;
}

export interface LinseerDataType {
  modelType: LinseerModelType;
  tokens: {
    access: string;
    refresh: string;
  };
}
