import { LinseerConfigType, LinseerDataType } from 'main/stores/config/types';
import { CompletionCacheClientMessage } from 'shared/types/WsMessage';

export enum ActionType {
  CompletionDisplay = 'CompletionDisplay',
  CompletionUpdate = 'CompletionUpdate',
  DebugSync = 'DebugSync',
  StoreSave = 'StoreSave',
}

export interface ActionMessage {
  type: ActionType;
  data: unknown;
}

export class CompletionDisplayActionMessage implements ActionMessage {
  type = ActionType.CompletionDisplay;
  data: {
    completions: string[];
    x: number;
    y: number;
  };

  constructor(
    data: { completions: string[]; x: number; y: number } = {
      completions: [],
      x: 0,
      y: 0,
    }
  ) {
    this.data = data;
  }
}

export class CompletionUpdateActionMessage implements ActionMessage {
  type = ActionType.CompletionUpdate;
  data: CompletionCacheClientMessage['data'];

  constructor(data: CompletionCacheClientMessage['data']) {
    this.data = data;
  }
}

export class DebugSyncActionMessage implements ActionMessage {
  type = ActionType.DebugSync;
  data: { content: string; path: string };

  constructor(data: { content: string; path: string }) {
    this.data = data;
  }
}

export class StoreSaveActionMessage implements ActionMessage {
  type = ActionType.StoreSave;
  data:
    | {
        type: 'config';
        data: Partial<LinseerConfigType>;
      }
    | {
        type: 'data';
        data: Partial<LinseerDataType>;
      };

  constructor(
    data:
      | {
          type: 'config';
          data: Partial<LinseerConfigType>;
        }
      | {
          type: 'data';
          data: Partial<LinseerDataType>;
        }
  ) {
    this.data = data;
  }
}

export interface ActionMessageMapping {
  [ActionType.CompletionDisplay]: CompletionDisplayActionMessage;
  [ActionType.CompletionUpdate]: CompletionUpdateActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
  [ActionType.StoreSave]: StoreSaveActionMessage;
}
