import { NetworkZone } from 'shared/config';

export interface SeparateTokens {
  end: string;
  middle: string;
  start: string;
}

export interface CompletionConfigType {
  contextLimit: number;
  maxTokenCount: number;
  stopTokens: string[];
  suggestionCount: number;
  temperature: number;
}

export interface AppConfig {
  networkZone: NetworkZone;
  baseServerUrl: string;
  username: string;
  token: string;
  refreshToken: string;
  activeTemplate: string;
  activeModel: string;
  activeModelKey: string;
  activeChat: string;
  useMultipleChat: boolean;
  useEnterSend: boolean;
  completionConfigs: {
    function: CompletionConfigType;
    line: CompletionConfigType;
    snippet: CompletionConfigType;
  };
}
