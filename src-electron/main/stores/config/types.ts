import { ApiStyle, LinseerModelType, SubModelType } from 'shared/types/model';

export interface SeparateTokens {
  end: string;
  middle: string;
  start: string;
}

export interface CommonConfigType {
  endpoints: {
    aiService: string;
    statistics: string;
    update: string;
  };
  server: {
    host: string;
    port: number;
  };
  userId: string;
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
  separateTokens: SeparateTokens;
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
