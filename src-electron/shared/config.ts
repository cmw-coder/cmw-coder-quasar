import { ApiStyle } from 'shared/types/model';

interface RuntimeConfig {
  apiStyle: ApiStyle;
  environment: 'old' | 'new';
}

const availableRuntimeConfigs: Record<string, RuntimeConfig> = {
  DEFAULT_CONFIG: {
    apiStyle: ApiStyle.Linseer
  },
  HuggingFace: {
    apiStyle: ApiStyle.HuggingFace
  }
} as const;
export const runtimeConfig = availableRuntimeConfigs.DEFAULT_CONFIG;
