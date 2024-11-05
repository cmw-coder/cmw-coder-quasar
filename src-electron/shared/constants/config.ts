import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

export const COMPLETION_CONFIG_CONSTANTS: Record<
  keyof AppConfig['completion'],
  {
    default: number;
    min: number;
    max: number;
  }
> = {
  debounceDelay: {
    default: 100,
    min: 0,
    max: 150,
  },
  interactionUnlockDelay: {
    default: 150,
    min: 0,
    max: 200,
  },
  prefixLineCount: {
    default: 200,
    min: 0,
    max: 500,
  },
  suffixLineCount: {
    default: 80,
    min: 0,
    max: 200,
  },
};
