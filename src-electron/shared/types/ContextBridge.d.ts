import { ActionMessageMapping } from 'shared/types/ActionMessage';
import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { WindowType } from 'shared/types/WindowType';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    [controlApiKey]: {
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
    [actionApiKey]: {
      invoke: <T extends keyof ActionMessageMapping>(
        message: ActionMessageMapping[T],
      ) => Promise<ActionMessageMapping[T]>;
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
