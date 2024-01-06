import { CaretPosition, Completions } from 'shared/types/common';

export enum WsAction {
  CompletionAccept = 'CompletionAccept',
  CompletionCache = 'CompletionCache',
  CompletionCancel = 'CompletionCancel',
  CompletionGenerate = 'CompletionGenerate',
  DebugSync = 'DebugSync',
  ImmersiveHide = 'ImmersiveHide',
  ImmersiveShow = 'ImmersiveShow',
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
  data: boolean;
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
    caret: CaretPosition & { xPixel: number; yPixel: number };
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
  data: StandardResult<{ completions: Completions }>;
  timestamp = Date.now();

  constructor(data: StandardResult<{ completions: Completions }>) {
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

export class DebugSyncServerMessage implements WsMessage {
  action = WsAction.DebugSync;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface ImmersiveHideClientMessage extends WsMessage {
  action: WsAction.ImmersiveHide;
  data: undefined;
}

export class ImmersiveHideServerMessage implements WsMessage {
  action = WsAction.ImmersiveHide;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface ImmersiveShowClientMessage extends WsMessage {
  action: WsAction.ImmersiveShow;
  data: undefined;
}

export class ImmersiveShowServerMessage implements WsMessage {
  action = WsAction.ImmersiveShow;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface WsClientMessageMapping {
  [WsAction.CompletionAccept]: CompletionAcceptClientMessage;
  [WsAction.CompletionCache]: CompletionCacheClientMessage;
  [WsAction.CompletionCancel]: CompletionCancelClientMessage;
  [WsAction.CompletionGenerate]: CompletionGenerateClientMessage;
  [WsAction.DebugSync]: DebugSyncClientMessage;
  [WsAction.ImmersiveHide]: ImmersiveHideClientMessage;
  [WsAction.ImmersiveShow]: ImmersiveShowClientMessage;
}

export interface WsServerMessageMapping {
  [WsAction.CompletionAccept]: CompletionAcceptServerMessage;
  [WsAction.CompletionCache]: CompletionCacheServerMessage;
  [WsAction.CompletionCancel]: CompletionCancelServerMessage;
  [WsAction.CompletionGenerate]: Promise<CompletionGenerateServerMessage>;
  [WsAction.DebugSync]: DebugSyncServerMessage;
  [WsAction.ImmersiveHide]: ImmersiveHideServerMessage;
  [WsAction.ImmersiveShow]: ImmersiveShowServerMessage;
}
