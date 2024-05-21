import { ApiStyle } from 'shared/types/model';
import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

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

export const defaultServerUrlMap: Record<NetworkZone, string> = {
  [NetworkZone.Normal]: 'http://10.113.36.121',
  [NetworkZone.Secure]: 'http://10.113.12.206',
  [NetworkZone.Public]: 'http://rdee.h3c.com',
  [NetworkZone.Unknown]: 'http://rdee.h3c.com',
};

export const defaultAppConfigNetworkZoneMap: Record<NetworkZone, AppConfig> = {
  [NetworkZone.Normal]: {
    networkZone: NetworkZone.Unknown,
    username: '',
    token: '',
    refreshToken: '',
    baseServerUrl: defaultServerUrlMap[NetworkZone.Normal],
    activeTemplate: 'Comware产品线',
    activeModel: 'CmwCoder',
    activeModelKey: 'CmwCoder',
    activeChat: 'default',
    useEnterSend: false,
    useMultipleChat: true,
    darkMode: false,
    developerMode: false,
    completionConfigs: {
      function: {
        contextLimit: 1500,
        maxTokenCount: 1024,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\n}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      line: {
        contextLimit: 1500,
        maxTokenCount: 64,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\r\n', '\n'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      snippet: {
        contextLimit: 1500,
        maxTokenCount: 96,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
    },
  },
  [NetworkZone.Public]: {
    networkZone: NetworkZone.Unknown,
    username: '',
    token: '',
    refreshToken: '',
    baseServerUrl: defaultServerUrlMap[NetworkZone.Public],
    activeTemplate: 'H3C通用',
    activeModel: '百业灵犀-13B',
    activeModelKey: 'LS13B',
    activeChat: 'default',
    useEnterSend: false,
    useMultipleChat: true,
    darkMode: false,
    developerMode: false,
    completionConfigs: {
      function: {
        contextLimit: 1500,
        maxTokenCount: 1024,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\n}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      line: {
        contextLimit: 1500,
        maxTokenCount: 64,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\r\n', '\n'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      snippet: {
        contextLimit: 1500,
        maxTokenCount: 96,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
    },
  },
  [NetworkZone.Secure]: {
    networkZone: NetworkZone.Unknown,
    username: '',
    token: '',
    refreshToken: '',
    baseServerUrl: defaultServerUrlMap[NetworkZone.Secure],
    activeTemplate: 'Comware产品线',
    activeModel: 'CmwCoder',
    activeModelKey: 'CmwCoder',
    activeChat: 'default',
    useEnterSend: false,
    useMultipleChat: true,
    darkMode: false,
    developerMode: false,
    completionConfigs: {
      function: {
        contextLimit: 1500,
        maxTokenCount: 1024,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\n}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      line: {
        contextLimit: 1500,
        maxTokenCount: 64,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\r\n', '\n'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      snippet: {
        contextLimit: 1500,
        maxTokenCount: 96,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
    },
  },
  [NetworkZone.Unknown]: {
    networkZone: NetworkZone.Unknown,
    username: '',
    token: '',
    refreshToken: '',
    baseServerUrl: defaultServerUrlMap[NetworkZone.Unknown],
    activeTemplate: 'Comware产品线',
    activeModel: 'CmwCoder',
    activeModelKey: 'CmwCoder',
    activeChat: 'default',
    useEnterSend: false,
    useMultipleChat: true,
    darkMode: false,
    developerMode: false,
    completionConfigs: {
      function: {
        contextLimit: 1500,
        maxTokenCount: 1024,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\n}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      line: {
        contextLimit: 1500,
        maxTokenCount: 64,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '\r\n', '\n'],
        suggestionCount: 1,
        temperature: 0.2,
      },
      snippet: {
        contextLimit: 1500,
        maxTokenCount: 96,
        stopTokens: ['<fim_pad>', '<｜end▁of▁sentence｜>', '}'],
        suggestionCount: 1,
        temperature: 0.2,
      },
    },
  },
};

/**
 * @deprecated
 */
interface RuntimeConfig {
  apiStyle: ApiStyle;
  networkZone: NetworkZone;
}

/**
 * @deprecated
 */
const availableRuntimeConfigs: Record<string, RuntimeConfig> = {
  DEFAULT_CONFIG: {
    apiStyle: ApiStyle.Linseer,
    networkZone: NetworkZone.Normal,
  },
  Red: {
    apiStyle: ApiStyle.HuggingFace,
    networkZone: NetworkZone.Normal,
  },
  Route: {
    apiStyle: ApiStyle.HuggingFace,
    networkZone: NetworkZone.Secure,
  },
  Yellow: {
    apiStyle: ApiStyle.Linseer,
    networkZone: NetworkZone.Normal,
  },
} as const;

/**
 * @deprecated
 */
export const runtimeConfig = availableRuntimeConfigs.DEFAULT_CONFIG;
