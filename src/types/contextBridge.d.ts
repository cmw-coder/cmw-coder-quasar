import {
  controlApiKey,
  ControlMessageMapping,
  ControlType,
} from 'shared/types/ControlApi';
import { actionApiKey, ActionMessageMapping } from 'shared/types/ActionApi';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    [controlApiKey]: {
      [key in ControlType]: (message: ControlMessageMapping[key]) => void;
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
