import { Shortcut } from 'shared/types/keys';
import { AvailableLocales } from 'web/i18n';

export enum NetworkZone {
  // 红区
  Normal = 'Normal',
  // 黄、绿区
  Public = 'Public',
  // 路由红区
  Secure = 'Secure',
  // 未知 -- 默认值
  Unknown = 'Unknown',
}

export interface CompletionConfig {
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
  locale: AvailableLocales;
  useMultipleChat: boolean;
  useEnterSend: boolean;
  darkMode: boolean;
  developerMode: boolean;
  showSelectedTipsWindow: boolean;
  showStatusWindow: boolean;
  completionConfigs: {
    function: CompletionConfig;
    snippet: CompletionConfig;
  };
  completion: {
    debounceDelayMilliSeconds: number;
    pasteFixMaxTriggerLineCount: number;
    prefixLineCount: number;
    recentFileCount: number;
    suffixLineCount: number;
  };
  generic: {
    autoSaveIntervalSeconds: number;
    backupIntervalSeconds: number;
    interactionUnlockDelayMilliSeconds: number;
  };
  shortcut: {
    commit: Shortcut;
    manualCompletion: Shortcut;
  };
  statistic: {
    checkEditedCompletion: boolean;
  };
}
