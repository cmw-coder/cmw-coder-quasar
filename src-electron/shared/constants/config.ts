import {
  AppCompletionBooleanConfig,
  AppCompletionNumberConfig,
} from 'shared/types/service/ConfigServiceTrait/types';

export const APPDATA_NUMBER_CONSTANTS: Record<
  string,
  { default: number; min: number; max: number }
> = {
  backupInterval: {
    default: 5,
    min: 0,
    max: 1440,
  },
};

export const COMPLETION_CONFIG_BOOLEAN_CONSTANTS: Record<
  keyof AppCompletionBooleanConfig,
  { default: boolean }
> = {
  completionOnPaste: {
    default: true,
  },
};

export const COMPLETION_CONFIG_NUMBER_CONSTANTS: Record<
  keyof AppCompletionNumberConfig,
  { default: number; min: number; max: number }
> = {
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
  pasteMaxLineCount: {
    default: 10,
    min: 0,
    max: 300,
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
