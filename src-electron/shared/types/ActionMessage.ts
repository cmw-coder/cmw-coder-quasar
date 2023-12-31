import { LinseerConfigType, LinseerDataType } from 'main/stores/config/types';
import { DataWindowType } from 'main/stores/data/types';
import { CompletionCacheClientMessage } from 'shared/types/WsMessage';
import { Completions } from 'shared/types/common';

export enum ActionType {
  CompletionClear = 'CompletionClear',
  CompletionSet = 'CompletionSet',
  CompletionUpdate = 'CompletionUpdate',
  ConfigStoreSave = 'ConfigStoreSave',
  DataStoreSave = 'DataStoreSave',
  DebugSync = 'DebugSync',
}

export interface ActionMessage {
  type: ActionType;
  data: unknown;
}

export class CompletionClearActionMessage implements ActionMessage {
  type = ActionType.CompletionClear;
  data: undefined;
}

export class CompletionSetActionMessage implements ActionMessage {
  type = ActionType.CompletionSet;
  data: Completions;

  constructor(data: Completions) {
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

export class ConfigStoreSaveActionMessage implements ActionMessage {
  type = ActionType.ConfigStoreSave;
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

export class DataStoreSaveActionMessage implements ActionMessage {
  type = ActionType.DataStoreSave;
  data: { type: 'window'; data: Partial<DataWindowType> };

  constructor(data: { type: 'window'; data: Partial<DataWindowType> }) {
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

export interface ActionMessageMapping {
  [ActionType.CompletionClear]: CompletionClearActionMessage;
  [ActionType.CompletionSet]: CompletionSetActionMessage;
  [ActionType.CompletionUpdate]: CompletionUpdateActionMessage;
  [ActionType.ConfigStoreSave]: ConfigStoreSaveActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
  [ActionType.DataStoreSave]: DataStoreSaveActionMessage;
}
