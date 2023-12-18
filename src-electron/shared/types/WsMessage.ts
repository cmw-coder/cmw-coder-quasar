export enum WsAction {
  CompletionAccept = 'CompletionAccept',
  CompletionCache = 'CompletionCache',
  CompletionCancel = 'CompletionCancel',
  CompletionGenerate = 'CompletionGenerate',
  DebugSync = 'DebugSync',
  InfoProjectId = 'InfoProjectId',
  InfoPluginVersion = 'InfoPluginVersion',
}

export interface WsMessage {
  action: WsAction;
  data: unknown;
  timestamp: number;
}

export type StandardResult =
  | {
      result: 'error' | 'failure';
      message: string;
    }
  | {
      result: 'success';
    };

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
    cursor: {
      character: number;
      line: number;
    };
    path: string;
    prefix: string;
    suffix: string;
    symbolString: string;
    tabString: string;
  };
}

export class CompletionGenerateServerMessage implements WsMessage {
  action = WsAction.CompletionGenerate;
  data: StandardResult & { completion: string };
  timestamp = Date.now();

  constructor(data: StandardResult & { completion: string }) {
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

export interface InfoProjectIdClientMessage extends WsMessage {
  action: WsAction.InfoProjectId;
  data: undefined;
}

export class InfoProjectIdServerMessage implements WsMessage {
  action = WsAction.InfoProjectId;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface InfoPluginVersionClientMessage extends WsMessage {
  action: WsAction.InfoPluginVersion;
  data: undefined;
}

export class InfoPluginVersionServerMessage implements WsMessage {
  action = WsAction.InfoPluginVersion;
  data: StandardResult;
  timestamp = Date.now();

  constructor(data: StandardResult) {
    this.data = data;
  }
}

export interface WsMessageMapping {
  [WsAction.CompletionAccept]: CompletionAcceptClientMessage;
  [WsAction.CompletionCache]: CompletionCacheClientMessage;
  [WsAction.CompletionCancel]: CompletionCancelClientMessage;
  [WsAction.CompletionGenerate]: CompletionGenerateClientMessage;
  [WsAction.DebugSync]: DebugSyncClientMessage;
  [WsAction.InfoProjectId]: InfoProjectIdClientMessage;
  [WsAction.InfoPluginVersion]: InfoPluginVersionClientMessage;
}
