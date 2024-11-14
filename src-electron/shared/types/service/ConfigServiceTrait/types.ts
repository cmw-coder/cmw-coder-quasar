import { NetworkZone } from 'shared/config';

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
  locale: string;
  useMultipleChat: boolean;
  useEnterSend: boolean;
  darkMode: boolean;
  developerMode: boolean;
  showSelectedTipsWindow: boolean;
  completion: {
    completionOnPaste: boolean;
    debounceDelay: number;
    interactionUnlockDelay: number;
    prefixLineCount: number;
    recentFileCount: number;
    suffixLineCount: number;
  };
  completionConfigs: {
    function: CompletionConfigType;
    line: CompletionConfigType;
    snippet: CompletionConfigType;
  };
}

export type AppCompletionBooleanConfig = Pick<
  AppConfig['completion'],
  'completionOnPaste'
>;
export type AppCompletionNumberConfig = Pick<
  AppConfig['completion'],
  | 'debounceDelay'
  | 'interactionUnlockDelay'
  | 'prefixLineCount'
  | 'recentFileCount'
  | 'suffixLineCount'
>;
