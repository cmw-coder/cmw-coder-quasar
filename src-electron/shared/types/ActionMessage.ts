import { LinseerConfigType, LinseerDataType } from 'main/stores/config/types';
import { DataProjectType, DataWindowType } from 'main/stores/data/types';
import { CompletionCacheClientMessage } from 'shared/types/WsMessage';

export enum ActionType {
  ClientSetProjectId = 'ClientSetProjectId',
  CompletionClear = 'CompletionClear',
  CompletionSet = 'CompletionSet',
  CompletionUpdate = 'CompletionUpdate',
  ConfigStoreSave = 'ConfigStoreSave',
  DataStoreSave = 'DataStoreSave',
  DebugSync = 'DebugSync',
  UpdateCheck = 'UpdateCheck',
  UpdateFinish = 'UpdateFinish',
  UpdateProgress = 'UpdateProgress',
  UpdateResponse = 'UpdateResponse',
}

export interface ActionMessage {
  type: ActionType;
  data: unknown;
}

export class ClientSetProjectIdActionMessage implements ActionMessage {
  type = ActionType.ClientSetProjectId;
  data: {
    path: string;
    pid: number;
    projectId: string;
  };

  constructor(data: { path: string; pid: number; projectId: string }) {
    this.data = data;
  }
}

export class CompletionClearActionMessage implements ActionMessage {
  type = ActionType.CompletionClear;
  data: undefined;
}

export class CompletionSetActionMessage implements ActionMessage {
  type = ActionType.CompletionSet;
  data: {
    completion: string;
    count: { index: number; total: number };
  };

  constructor(data: {
    completion: string;
    count: { index: number; total: number };
  }) {
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
  data:
    | { type: 'project'; data: Partial<DataProjectType> }
    | { type: 'window'; data: Partial<DataWindowType> };

  constructor(
    data:
      | { type: 'project'; data: Partial<DataProjectType> }
      | { type: 'window'; data: Partial<DataWindowType> }
  ) {
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

export class UpdateCheckActionMessage implements ActionMessage {
  type = ActionType.UpdateCheck;
  data: undefined;
}

export class UpdateFinishActionMessage implements ActionMessage {
  type = ActionType.UpdateFinish;
  data: undefined;
}

export class UpdateProgressActionMessage implements ActionMessage {
  type = ActionType.UpdateProgress;
  data: {
    total: number;
    delta: number;
    transferred: number;
    percent: number;
    bytesPerSecond: number;
  };

  constructor(data: {
    total: number;
    delta: number;
    transferred: number;
    percent: number;
    bytesPerSecond: number;
  }) {
    this.data = data;
  }
}

export class UpdateResponseActionMessage implements ActionMessage {
  type = ActionType.UpdateResponse;
  data: boolean;

  constructor(data: boolean) {
    this.data = data;
  }
}

export interface ActionMessageMapping {
  [ActionType.ClientSetProjectId]: ClientSetProjectIdActionMessage;
  [ActionType.CompletionClear]: CompletionClearActionMessage;
  [ActionType.CompletionSet]: CompletionSetActionMessage;
  [ActionType.CompletionUpdate]: CompletionUpdateActionMessage;
  [ActionType.ConfigStoreSave]: ConfigStoreSaveActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
  [ActionType.DataStoreSave]: DataStoreSaveActionMessage;
  [ActionType.UpdateCheck]: UpdateCheckActionMessage;
  [ActionType.UpdateFinish]: UpdateFinishActionMessage;
  [ActionType.UpdateProgress]: UpdateProgressActionMessage;
  [ActionType.UpdateResponse]: UpdateResponseActionMessage;
}
