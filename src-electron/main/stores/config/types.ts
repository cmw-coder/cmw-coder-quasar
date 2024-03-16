import {
  ApiStyle,
  HuggingFaceModelType,
  LinseerModelType,
  SubModelType,
} from 'shared/types/model';

export interface SeparateTokens {
  end: string;
  middle: string;
  start: string;
}

export interface CommonConfigType {
  endpoints: {
    collection: string;
    feedback: string;
    statistics: string;
    update: string;
  };
  server: {
    host: string;
    port: number;
  };
  userId: string;
}

/// HuggingFace --------------------------------------------------------------------------------------------------------

export interface HuggingFaceCompletionConfigType {
  contextLimit: number;
  endpoint: string;
  maxTokenCount: number;
  stopTokens: string[];
  suggestionCount: number;
  temperature: number;
}

export interface HuggingFaceModelConfigType {
  completionConfigs: {
    function: HuggingFaceCompletionConfigType;
    line: HuggingFaceCompletionConfigType;
    snippet: HuggingFaceCompletionConfigType;
  };
  modelType: HuggingFaceModelType;
  separateTokens: SeparateTokens;
}

export interface HuggingFaceConfigType extends CommonConfigType {
  modelConfigs: HuggingFaceModelConfigType[];
}

export interface HuggingFaceDataType {
  modelType: HuggingFaceModelType;
}

export interface HuggingFaceStoreType {
  apiStyle: ApiStyle.HuggingFace;
  config: HuggingFaceConfigType;
  data: HuggingFaceDataType;
}

/// Linseer ------------------------------------------------------------------------------------------------------------

export interface LinseerCompletionConfigType {
  contextLimit: number;
  maxTokenCount: number;
  stopTokens: string[];
  subModelType: SubModelType;
  suggestionCount: number;
  temperature: number;
}

export interface LinseerModelConfigType {
  completionConfigs: {
    function: LinseerCompletionConfigType;
    line: LinseerCompletionConfigType;
    snippet: LinseerCompletionConfigType;
  };
  endpoint: string;
  modelType: LinseerModelType;
}

export interface LinseerConfigType extends CommonConfigType {
  modelConfigs: LinseerModelConfigType[];
}

export interface LinseerDataType {
  modelType: LinseerModelType;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface LinseerStoreType {
  apiStyle: ApiStyle.Linseer;
  config: LinseerConfigType;
  data: LinseerDataType;
}
