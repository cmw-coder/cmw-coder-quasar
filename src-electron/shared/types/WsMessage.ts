import { CaretPosition, SymbolInfo } from 'shared/types/common';
import { Completions } from 'main/components/PromptProcessor/types';
import { KeptRatio } from 'main/components/StatisticsReporter/types';

export enum WsAction {
  CompletionAccept = 'CompletionAccept',
  CompletionCache = 'CompletionCache',
  CompletionCancel = 'CompletionCancel',
  CompletionGenerate = 'CompletionGenerate',
  CompletionKept = 'CompletionKept',
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

export type StandardResult<T = unknown> =
  | {
      result: 'failure' | 'error';
      message: string;
    }
  | ({ result: 'success' } & T);

export interface CompletionAcceptClientMessage extends WsMessage {
  action: WsAction.CompletionAccept;
  data: {
    actionId: string;
    index: number;
  };
}

export interface CompletionCacheClientMessage extends WsMessage {
  action: WsAction.CompletionCache;
  data: boolean;
}

export interface CompletionCancelClientMessage extends WsMessage {
  action: WsAction.CompletionCancel;
  data: {
    actionId: string;
    explicit: boolean;
  };
}

export interface CompletionGenerateClientMessage extends WsMessage {
  action: WsAction.CompletionGenerate;
  data: {
    caret: CaretPosition;
    path: string;
    prefix: string;
    project: string;
    recentFiles: string[];
    suffix: string;
    symbols: SymbolInfo[];
  };
}

export class CompletionGenerateServerMessage implements WsMessage {
  action = WsAction.CompletionGenerate;
  data: StandardResult<{ actionId: string; completions: Completions }>;
  timestamp = Date.now();

  constructor(
    data: StandardResult<{ actionId: string; completions: Completions }>,
  ) {
    this.data = data;
  }
}

export interface CompletionKeptClientMessage extends WsMessage {
  action: WsAction.CompletionKept;
  data: {
    actionId: string;
    count: number;
    editedContent: string;
    ratio: KeptRatio;
  };
}

export interface CompletionSelectClientMessage extends WsMessage {
  action: WsAction.CompletionGenerate;
  data: {
    actionId: string;
    index: number;
    dimensions: {
      height: number;
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
    }>,
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
    server: Promise<CompletionGenerateServerMessage | void>;
  };
  [WsAction.CompletionKept]: {
    client: CompletionKeptClientMessage;
    server: void;
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
