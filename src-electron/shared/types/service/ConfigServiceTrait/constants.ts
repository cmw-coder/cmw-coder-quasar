import { Modifier } from 'shared/types/keys';
import {
  AppConfig,
  NetworkZone,
} from 'shared/types/service/ConfigServiceTrait/types';

export const DEFAULT_SERVER_URL_MAP: Record<NetworkZone, string> = {
  [NetworkZone.Normal]: 'http://10.113.36.121',
  [NetworkZone.Secure]: 'http://10.113.12.206',
  [NetworkZone.Public]: 'http://rdee.h3c.com',
  [NetworkZone.Unknown]: 'http://rdee.h3c.com',
};

export const DEFAULT_CONFIG_BASE: AppConfig = {
  networkZone: NetworkZone.Unknown,
  baseServerUrl: DEFAULT_SERVER_URL_MAP[NetworkZone.Unknown],
  username: '',
  token: '',
  refreshToken: '',
  activeTemplate: '',
  activeModel: '',
  activeModelKey: '',
  activeChat: 'default',
  locale: 'zh-CN',
  useMultipleChat: true,
  useEnterSend: false,
  darkMode: false,
  developerMode: false,
  showSelectedTipsWindow: true,
  showStatusWindow: true,
  completionConfigs: {
    function: {
      maxTokenCount: 1024,
      stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>'],
      suggestionCount: 1,
      temperature: 0.2,
    },
    snippet: {
      maxTokenCount: 96,
      stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>'],
      suggestionCount: 1,
      temperature: 0.2,
    },
  },
  completion: {
    debounceDelayMilliSeconds: 50,
    pasteFixMaxTriggerLineCount: 10,
    prefixLineCount: 200,
    recentFileCount: 5,
    suffixLineCount: 80,
  },
  generic: {
    autoSaveIntervalSeconds: 300,
    backupIntervalSeconds: 300,
    interactionUnlockDelayMilliSeconds: 50,
  },
  shortcut: {
    commit: {
      keycode: 'K'.charCodeAt(0),
      modifiers: [Modifier.Alt, Modifier.Ctrl],
    },
    manualCompletion: {
      keycode: 0x0d,
      modifiers: [Modifier.Alt],
    },
  },
  statistic: {
    checkEditedCompletion: false,
  },
};

export const DEFAULT_CONFIG_MAP: Record<NetworkZone, AppConfig> = {
  [NetworkZone.Normal]: {
    ...DEFAULT_CONFIG_BASE,
    networkZone: NetworkZone.Normal,
    baseServerUrl: DEFAULT_SERVER_URL_MAP[NetworkZone.Normal],
    activeTemplate: 'Comware产品线',
    activeModel: 'CmwCoder',
    activeModelKey: 'CMW',
  },
  [NetworkZone.Public]: {
    ...DEFAULT_CONFIG_BASE,
    networkZone: NetworkZone.Public,
    baseServerUrl: DEFAULT_SERVER_URL_MAP[NetworkZone.Public],
    activeTemplate: 'H3C通用',
    activeModel: '百业灵犀-13B',
    activeModelKey: 'LS13B',
  },
  [NetworkZone.Secure]: {
    ...DEFAULT_CONFIG_BASE,
    networkZone: NetworkZone.Secure,
    baseServerUrl: DEFAULT_SERVER_URL_MAP[NetworkZone.Secure],
    activeTemplate: 'Comware产品线',
    activeModel: 'CmwCoder',
    activeModelKey: 'CMW',
  },
  [NetworkZone.Unknown]: {
    ...DEFAULT_CONFIG_BASE,
  },
};

export const NUMBER_CONFIG_CONSTRAINTS: Record<string, Record<string, {
  min: number;
  max: number;
  low?: number;
  high?: number;
}>> = {
  completion: {
    debounceDelayMilliSeconds: {
      min: 0,
      max: 500,
      low: 25,
      high: 350,
    },
    pasteFixMaxTriggerLineCount: {
      min: 0,
      max: 100,
      high: 50,
    },
    prefixLineCount: {
      min: 0,
      max: 1000,
      high: 500,
    },
    recentFileCount: {
      min: 0,
      max: 50,
      high: 10,
    },
    suffixLineCount: {
      min: 0,
      max: 1000,
      high: 500,
    },
  },
  generic: {
    autoSaveIntervalSeconds: {
      min: 0,
      max: 3600,
      low: 5,
    },
    backupIntervalSeconds: {
      min: 0,
      max: 3600,
      low: 5,
    },
    interactionUnlockDelayMilliSeconds: {
      min: 0,
      max: 500,
      low: 25,
      high: 350,
    },
  },
};
