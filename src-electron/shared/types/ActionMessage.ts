import {
  HuggingFaceStoreType,
  LinseerConfigType,
  LinseerDataType,
  LinseerStoreType,
} from 'main/stores/config/types';
import { CompletionCacheClientMessage } from 'shared/types/WsMessage';

export enum ActionType {
  ChatInsert = 'ChatInsert',
  CompletionClear = 'CompletionClear',
  CompletionSet = 'CompletionSet',
  CompletionUpdate = 'CompletionUpdate',
  ConfigStoreLoad = 'ConfigStoreLoad',
  ConfigStoreSave = 'ConfigStoreSave',
  DebugSync = 'DebugSync',
  RouterReload = 'RouterReload',
  UpdateDownload = 'UpdateDownload',
  UpdateFinish = 'UpdateFinish',
  UpdateProgress = 'UpdateProgress',
}

export interface ActionMessage {
  type: ActionType;
  data: unknown;
}

export class ChatInsertActionMessage implements ActionMessage {
  type = ActionType.ChatInsert;
  data: string;

  constructor(data: string) {
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
    fontHeight: number;
    fontSize: number;
  };

  constructor(data: {
    completion: string;
    count: { index: number; total: number };
    fontHeight: number;
    fontSize: number;
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

export class ConfigStoreLoadActionMessage implements ActionMessage {
  type = ActionType.ConfigStoreLoad;
  data: LinseerStoreType | HuggingFaceStoreType | undefined;

  constructor(data?: LinseerStoreType | HuggingFaceStoreType) {
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
        },
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

export class RouterReloadActionMessage implements ActionMessage {
  type = ActionType.RouterReload;
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

export class UpdateDownloadActionMessage implements ActionMessage {
  type = ActionType.UpdateDownload;
  data: undefined;
}

export interface ActionMessageMapping {
  [ActionType.ChatInsert]: ChatInsertActionMessage;
  [ActionType.CompletionClear]: CompletionClearActionMessage;
  [ActionType.CompletionSet]: CompletionSetActionMessage;
  [ActionType.CompletionUpdate]: CompletionUpdateActionMessage;
  [ActionType.ConfigStoreLoad]: ConfigStoreLoadActionMessage;
  [ActionType.ConfigStoreSave]: ConfigStoreSaveActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
  [ActionType.RouterReload]: RouterReloadActionMessage;
  [ActionType.UpdateDownload]: UpdateDownloadActionMessage;
  [ActionType.UpdateFinish]: UpdateFinishActionMessage;
  [ActionType.UpdateProgress]: UpdateProgressActionMessage;
}
