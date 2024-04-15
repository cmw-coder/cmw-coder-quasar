import { ACTION_API_KEY, CONTROL_API_KEY } from 'shared/constants/common';
import { ActionMessageMapping } from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    [CONTROL_API_KEY]: {
      close: (windowType: WindowType) => void;
      devTools: (windowType: WindowType) => void;
      hide: (windowType: WindowType) => void;
      minimize: (windowType: WindowType) => void;
      move: (
        position: { x?: number; y?: number },
        windowType: WindowType,
      ) => void;
      resize: (
        size: { width?: number; height?: number },
        windowType: WindowType,
      ) => void;
      reload: (windowType: WindowType) => void;
      show: (windowType: WindowType) => void;
      toggleMaximize: () => void;
    };
    [ACTION_API_KEY]: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      register: <T extends keyof ActionMessageMapping>(
        actionType: T,
        name: string,
        callback: (data: ActionMessageMapping[T]['data']) => void,
      ) => void;
      send: <T extends keyof ActionMessageMapping>(
        message: ActionMessageMapping[T],
      ) => void;
      unregister: <T extends keyof ActionMessageMapping>(
        actionType: T,
        name: string,
      ) => void;
    };
  }
}

export {};
