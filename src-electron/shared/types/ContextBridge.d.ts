import { ACTION_API_KEY, CONTROL_API_KEY } from 'shared/constants/common';
import { ServiceType } from 'shared/types/service';
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
      register: <T extends keyof ActionMessageMapping>(
        actionType: T,
        name: string,
        callback: (data: ActionMessageMapping[T]['data']) => void,
      ) => void;
      send: <T extends keyof ActionMessageMapping>(
        message: ActionMessageMapping[T],
      ) => void;
      service: <T extends ServiceType>(
        serviceName: T,
        functionName: string | symbol,
        ...args: never[]
      ) => Promise<never>;
      unregister: <T extends keyof ActionMessageMapping>(
        actionType: T,
        name: string,
      ) => void;
    };
  }
}

export {};
