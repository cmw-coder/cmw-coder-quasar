import { LinseerConfigType, LinseerDataType } from 'main/stores/config/types';

export enum ActionType {
  CompletionInline = 'CompletionInline',
  CompletionSnippet = 'CompletionInline',
  DebugSync = 'DebugSync',
  StoreSave = 'StoreSave',
}

export interface ActionMessage {
  type: ActionType;
  data: unknown;
}

export class CompletionInlineActionMessage implements ActionMessage {
  type = ActionType.CompletionInline;
  data: string[];

  constructor(data: string[]) {
    this.data = data;
  }
}

export class CompletionSnippetActionMessage implements ActionMessage {
  type = ActionType.CompletionSnippet;
  data: string[];

  constructor(data: string[]) {
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

export class StoreSaveActionMessage implements ActionMessage {
  type = ActionType.StoreSave;
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

export interface ActionMessageMapping {
  [ActionType.CompletionInline]: CompletionInlineActionMessage;
  [ActionType.CompletionSnippet]: CompletionSnippetActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
  [ActionType.StoreSave]: StoreSaveActionMessage;
}
