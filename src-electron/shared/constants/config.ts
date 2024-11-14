import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

export const COMPLETION_CONFIG_CONSTANTS: Record<
  keyof AppConfig['completion'],
  | {
      default: boolean;
    }
  | {
      default: number;
      min: number;
      max: number;
    }
> = {
  completionOnPaste: {
    default: true,
  },
  debounceDelay: {
    default: 50,
    min: 0,
    max: 150,
  },
  interactionUnlockDelay: {
    default: 50,
    min: 0,
    max: 150,
  },
  prefixLineCount: {
    default: 200,
    min: 0,
    max: 500,
  },
  recentFileCount: {
    default: 5,
    min: 1,
    max: 10,
  },
  suffixLineCount: {
    default: 80,
    min: 0,
    max: 200,
  },
};
