import { ActionMessageMapping } from 'preload/types/ActionApi';
import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { WindowType } from 'shared/types/WindowType';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    [controlApiKey]: {
      hide: (windowType: WindowType) => void;
      minimize: (windowType: WindowType) => void;
      move: (
        position: { x?: number; y?: number },
        windowType: WindowType
      ) => void;
      resize: (
        size: { width?: number; height?: number },
        windowType: WindowType
      ) => void;
      show: (windowType: WindowType) => void;
      toggleMaximize: () => void;
    };
    [actionApiKey]: {
      receive: <T extends keyof ActionMessageMapping>(
        actionType: T,
        callback: (data: ActionMessageMapping[T]['data']) => void
      ) => void;
      send: <T extends keyof ActionMessageMapping>(
        message: ActionMessageMapping[T]
      ) => void;
    };
  }
}

export {};
