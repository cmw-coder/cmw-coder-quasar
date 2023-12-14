import {
  ApiStyle,
  HuggingFaceModelType,
  LinseerModelType,
  SubModelType,
} from 'main/types/model';

export interface SeparateTokens {
  end: string;
  middle: string;
  start: string;
}

export interface CommonConfigType {
  server: {
    host: string;
    port: number;
  };
  statistics: string;
  userId: string;
}

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
  apiStyle: ApiStyle.HuggingFace;
  modelConfigs: HuggingFaceModelConfigType[];
}

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
  apiStyle: ApiStyle.Linseer;
  modelConfigs: LinseerModelConfigType[];
}
