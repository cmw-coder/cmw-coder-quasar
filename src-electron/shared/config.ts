import { ApiStyle } from 'shared/types/model';

export enum NetworkZone {
  Normal,
  Public,
  Secure,
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
export const runtimeConfig = availableRuntimeConfigs.DEFAULT_CONFIG;
