import { CaretPosition, SymbolInfo } from 'shared/types/common';

export enum WsAction {
  CompletionAccept = 'CompletionAccept',
  CompletionCache = 'CompletionCache',
  CompletionCancel = 'CompletionCancel',
  CompletionGenerate = 'CompletionGenerate',
  CompletionSelect = 'CompletionSelect',
  DebugSync = 'DebugSync',
  EditorFocusState = 'EditorFocusState',
  EditorSwitchProject = 'EditorSwitchProject',
  HandShake = 'HandShake',
}

export interface WsMessage {
  action: WsAction;
  data: unknown;
  timestamp: number;
}

type StandardResult<T = unknown> =
  | {
      result: 'failure' | 'error';
      message: string;
    }
  | ({ result: 'success' } & T);

export interface CompletionAcceptClientMessage extends WsMessage {
  action: WsAction.CompletionAccept;
  data: string;
}

export interface CompletionCacheClientMessage extends WsMessage {
  action: WsAction.CompletionCache;
  data: boolean;
}

export interface CompletionCancelClientMessage extends WsMessage {
  action: WsAction.CompletionCancel;
  data: undefined;
}

export interface CompletionGenerateClientMessage extends WsMessage {
  action: WsAction.CompletionGenerate;
  data: {
    caret: CaretPosition;
    path: string;
    prefix: string;
    recentFiles: string[];
    suffix: string;
    symbols: SymbolInfo[];
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

export interface CompletionSelectClientMessage extends WsMessage {
  action: WsAction.CompletionGenerate;
  data: {
    completion: string;
    count: {
      index: number;
      total: number;
    };
    position: {
      x: number;
      y: number;
    };
  };
}

export class CompletionSelectServerMessage implements WsMessage {
  action = WsAction.CompletionSelect;
  data: StandardResult<{
    completion: string;
    count: {
      index: number;
      total: number;
    };
  }>;
  timestamp = Date.now();

  constructor(
    data: StandardResult<{
      completion: string;
      count: {
        index: number;
        total: number;
      };
    }>
  ) {
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

export interface EditorFocusStateClientMessage extends WsMessage {
  action: WsAction.EditorFocusState;
  data: boolean;
}

export interface EditorSwitchProjectClientMessage extends WsMessage {
  action: WsAction.EditorSwitchProject;
  data: string;
}

export interface HandShakeClientMessage extends WsMessage {
  action: WsAction.HandShake;
  data: { pid: number; version: string };
}

export interface WsMessageMapping {
  [WsAction.CompletionAccept]: {
    client: CompletionAcceptClientMessage;
    server: void;
  };
  [WsAction.CompletionCache]: {
    client: CompletionCacheClientMessage;
    server: void;
  };
  [WsAction.CompletionCancel]: {
    client: CompletionCancelClientMessage;
    server: void;
  };
  [WsAction.CompletionGenerate]: {
    client: CompletionGenerateClientMessage;
    server: Promise<CompletionGenerateServerMessage>;
  };
  [WsAction.CompletionSelect]: {
    client: CompletionSelectClientMessage;
    server: void;
  };
  [WsAction.DebugSync]: { client: DebugSyncClientMessage; server: void };
  [WsAction.EditorFocusState]: {
    client: EditorFocusStateClientMessage;
    server: void;
  };
  [WsAction.EditorSwitchProject]: {
    client: EditorSwitchProjectClientMessage;
    server: void;
  };
}
