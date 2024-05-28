import { CompletionCacheClientMessage } from 'shared/types/WsMessage';

export enum ActionType {
  CompletionClear = 'CompletionClear',
  CompletionSet = 'CompletionSet',
  CompletionUpdate = 'CompletionUpdate',
  DebugSync = 'DebugSync',
  RouterReload = 'RouterReload',
  UpdateDownload = 'UpdateDownload',
  UpdateFinish = 'UpdateFinish',
  UpdateProgress = 'UpdateProgress',
  ToggleDarkMode = 'ToggleDarkMode',
}

export interface ActionMessage {
  type: ActionType;
  data: unknown;
}

export class ToggleDarkModeActionMessage implements ActionMessage {
  type = ActionType.ToggleDarkMode;
  data: boolean;
  constructor(data: boolean) {
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
  [ActionType.CompletionClear]: CompletionClearActionMessage;
  [ActionType.CompletionSet]: CompletionSetActionMessage;
  [ActionType.CompletionUpdate]: CompletionUpdateActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
  [ActionType.RouterReload]: RouterReloadActionMessage;
  [ActionType.UpdateDownload]: UpdateDownloadActionMessage;
  [ActionType.UpdateFinish]: UpdateFinishActionMessage;
  [ActionType.UpdateProgress]: UpdateProgressActionMessage;
  [ActionType.ToggleDarkMode]: ToggleDarkModeActionMessage;
}
