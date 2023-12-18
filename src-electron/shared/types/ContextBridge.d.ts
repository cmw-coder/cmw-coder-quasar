import { ControlType } from 'preload/types/ControlApi';
import { ActionMessageMapping } from 'preload/types/ActionApi';
import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { WindowType } from 'shared/types/WindowType';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    [controlApiKey]: {
      [ControlType.Close]: () => void;
      [ControlType.Hide]: (windowType: WindowType) => void;
      [ControlType.Minimize]: (windowType: WindowType) => void;
      [ControlType.Move]: (
        position: { x?: number; y?: number },
        windowType: WindowType
      ) => void;
      [ControlType.Resize]: (
        size: { width?: number; height?: number },
        windowType: WindowType
      ) => void;
      [ControlType.Show]: (windowType: WindowType) => void;
      [ControlType.ToggleMaximize]: () => void;
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
