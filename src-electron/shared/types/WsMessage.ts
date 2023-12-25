import { CaretPosition } from 'shared/types/common';

export enum WsAction {
  CompletionAccept = 'CompletionAccept',
  CompletionCache = 'CompletionCache',
  CompletionCancel = 'CompletionCancel',
  CompletionGenerate = 'CompletionGenerate',
  DebugSync = 'DebugSync',
}

export interface WsMessage {
  action: WsAction;
  data: unknown;
  timestamp: number;
}

type StandardResult<T = Record<string, never>> =
  | {
      result: 'failure' | 'error';
      message: string;
    }
  | ({ result: 'success' } & T);

export interface CompletionAcceptClientMessage extends WsMessage {
  action: WsAction.CompletionAccept;
  data: undefined;
}

export class CompletionAcceptServerMessage implements WsMessage {
  action = WsAction.CompletionAccept;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface CompletionCacheClientMessage extends WsMessage {
  action: WsAction.CompletionCache;
  data:
    | {
        character: string;
        isDelete: false;
      }
    | {
        isDelete: true;
      };
}

export class CompletionCacheServerMessage implements WsMessage {
  action = WsAction.CompletionCache;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface CompletionCancelClientMessage extends WsMessage {
  action: WsAction.CompletionCancel;
  data: undefined;
}

export class CompletionCancelServerMessage implements WsMessage {
  action = WsAction.CompletionCancel;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface CompletionGenerateClientMessage extends WsMessage {
  action: WsAction.CompletionGenerate;
  data: {
    caret: CaretPosition;
    path: string;
    prefix: string;
    projectId: string;
    suffix: string;
    symbolString: string;
    tabString: string;
  };
}

export class CompletionGenerateServerMessage implements WsMessage {
  action = WsAction.CompletionGenerate;
  data: StandardResult<{ completions: string[] }>;
  timestamp = Date.now();

  constructor(data: StandardResult<{ completions: string[] }>) {
    this.data = data;
  }
}

export interface DebugSyncClientMessage extends WsMessage {
  action: WsAction.DebugSync;
  data: {
    content: string;
    path: string;
  };
}

export interface WsClientMessageMapping {
  [WsAction.CompletionAccept]: CompletionAcceptClientMessage;
  [WsAction.CompletionCache]: CompletionCacheClientMessage;
  [WsAction.CompletionCancel]: CompletionCancelClientMessage;
  [WsAction.CompletionGenerate]: CompletionGenerateClientMessage;
  [WsAction.DebugSync]: DebugSyncClientMessage;
}

export interface WsServerMessageMapping {
  [WsAction.CompletionAccept]: CompletionAcceptServerMessage;
  [WsAction.CompletionCache]: CompletionCacheServerMessage;
  [WsAction.CompletionCancel]: CompletionCancelServerMessage;
  [WsAction.CompletionGenerate]: Promise<CompletionGenerateServerMessage>;
  [WsAction.DebugSync]: void;
}
