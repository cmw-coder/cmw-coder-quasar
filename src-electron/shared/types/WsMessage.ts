import { Reference } from 'cmw-coder-subprocess';

import {
  CaretPosition,
  Completions,
  GenerateType,
  KeptRatio,
  SymbolInfo,
} from 'shared/types/common';
import { ShortcutConfig } from 'shared/types/keys';
import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

export enum WsAction {
  ChatInsert = 'ChatInsert',
  CompletionAccept = 'CompletionAccept',
  CompletionCache = 'CompletionCache',
  CompletionCancel = 'CompletionCancel',
  CompletionEdit = 'CompletionEdit',
  CompletionGenerate = 'CompletionGenerate',
  CompletionSelect = 'CompletionSelect',
  EditorCommit = 'EditorCommit',
  EditorFocusState = 'EditorFocusState',
  EditorPaste = 'EditorPaste',
  EditorSelection = 'EditorSelection',
  EditorSwitchFile = 'EditorSwitchFile',
  EditorSwitchProject = 'EditorSwitchProject',
  HandShake = 'HandShake',
  ReviewRequest = 'ReviewRequest',
  SettingSync = 'SettingSync',
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

export class ChatInsertServerMessage implements WsMessage {
  action = WsAction.ChatInsert;
  data: StandardResult<{ content: string }>;
  timestamp = Date.now();

  constructor(data: ChatInsertServerMessage['data']) {
    this.data = data;
  }
}

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
    type: GenerateType;
    caret: CaretPosition;
    path: string;
    context: {
      infix: string;
      prefix: string;
      suffix: string;
    };
    recentFiles: string[];
    symbols: SymbolInfo[];
    times: {
      start: number;
      context: number;
      recentFiles: number;
      symbol: number;
      end: number;
    };
  };
}

export class CompletionGenerateServerMessage implements WsMessage {
  action = WsAction.CompletionGenerate;
  data: StandardResult<{
    actionId: string;
    type: GenerateType;
    completions: Completions;
  }>;
  timestamp = Date.now();

  constructor(data: CompletionGenerateServerMessage['data']) {
    this.data = data;
  }
}

export interface CompletionEditClientMessage extends WsMessage {
  action: WsAction.CompletionEdit;
  data: {
    actionId: string;
    count: number;
    editedContent: string;
    ratio: KeptRatio;
  };
}

export interface CompletionSelectClientMessage extends WsMessage {
  action: WsAction.CompletionSelect;
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

// export class CompletionSelectServerMessage implements WsMessage {
//   action = WsAction.CompletionSelect;
//   data: StandardResult<{
//     completion: string;
//     count: {
//       index: number;
//       total: number;
//     };
//   }>;
//   timestamp = Date.now();
//
//   constructor(
//     data: StandardResult<{
//       completion: string;
//       count: {
//         index: number;
//         total: number;
//       };
//     }>,
//   ) {
//     this.data = data;
//   }
// }

export interface EditorCommitClientMessage extends WsMessage {
  action: WsAction.EditorCommit;
  data: string;
}

export interface EditorFocusStateClientMessage extends WsMessage {
  action: WsAction.EditorFocusState;
  data: boolean;
}

export interface EditorPasteClientMessage extends WsMessage {
  action: WsAction.EditorPaste;
  data: {
    content: string;
    position: {
      character: number;
      line: number;
    };
    recentFiles: string[];
  };
}

export interface EditorSelectionClientMessage extends WsMessage {
  action: WsAction.EditorSelection;
  data: {
    path: string;
    content: string;
    block: string;
    begin: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
    dimensions: {
      height: number;
      x: number;
      y: number;
    };
  };
}

export interface EditorSwitchFileClientMessage extends WsMessage {
  action: WsAction.EditorSwitchFile;
  data: string;
}

export interface EditorSwitchProjectClientMessage extends WsMessage {
  action: WsAction.EditorSwitchProject;
  data: string;
}

export interface HandShakeClientMessage extends WsMessage {
  action: WsAction.HandShake;
  data: { pid: number; currentProject: string; version: string };
}

export interface ReviewRequestClientMessage extends WsMessage {
  action: WsAction.ReviewRequest;
  data: {
    id: string;
    references: Reference[];
  };
}

export class ReviewRequestServerMessage implements WsMessage {
  action = WsAction.ReviewRequest;
  data: StandardResult<{
    id: string;
    content: string;
    path: string;
    beginLine: number;
    endLine: number;
  }>;
  timestamp = Date.now();

  constructor(data: ReviewRequestServerMessage['data']) {
    this.data = data;
  }
}

export class SettingSyncServerMessage implements WsMessage {
  action = WsAction.SettingSync;
  data: StandardResult<{
    completionConfig?: Partial<AppConfig['completion']>;
    shortcutConfig?: ShortcutConfig;
  }>;
  timestamp = Date.now();

  constructor(data: SettingSyncServerMessage['data']) {
    this.data = data;
  }
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
  [WsAction.CompletionEdit]: {
    client: CompletionEditClientMessage;
    server: void;
  };
  [WsAction.CompletionGenerate]: {
    client: CompletionGenerateClientMessage;
    server: Promise<CompletionGenerateServerMessage | void>;
  };
  [WsAction.CompletionSelect]: {
    client: CompletionSelectClientMessage;
    server: void;
  };
  [WsAction.EditorCommit]: {
    client: EditorCommitClientMessage;
    server: void;
  };
  [WsAction.EditorFocusState]: {
    client: EditorFocusStateClientMessage;
    server: void;
  };
  [WsAction.EditorPaste]: {
    client: EditorPasteClientMessage;
    server: void;
  };
  [WsAction.EditorSelection]: {
    client: EditorSelectionClientMessage;
    server: void;
  };
  [WsAction.EditorSwitchFile]: {
    client: EditorSwitchFileClientMessage;
    server: void;
  };
  [WsAction.EditorSwitchProject]: {
    client: EditorSwitchProjectClientMessage;
    server: void;
  };
  [WsAction.ReviewRequest]: {
    client: ReviewRequestClientMessage;
    server: void;
  };
  [WsAction.SettingSync]: {
    client: void;
    server: SettingSyncServerMessage;
  };
}
