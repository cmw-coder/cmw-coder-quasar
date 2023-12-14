import { Action } from 'app/src-electron/types/action';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    controlApi: {
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
    };
    subscribeApi: {
      action: (action: Action, callback: (data: never) => void) => void;
    };
  }
}
export {};
