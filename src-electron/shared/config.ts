import { ApiStyle } from 'shared/types/model';

export enum NetworkZone {
  // 红区
  Normal,
  // 黄、绿区
  Public,
  // 路由红区
  Secure,
  // 未知 -- 默认值
  Unknown,
}

interface RuntimeConfig {
  apiStyle: ApiStyle;
  networkZone: NetworkZone;
}

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
