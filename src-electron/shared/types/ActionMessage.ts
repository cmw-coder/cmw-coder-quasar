import { CompletionCacheClientMessage } from 'shared/types/WsMessage';
import { Selection } from 'shared/types/Selection';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';

export enum ActionType {
  CompletionClear = 'CompletionClear',
  CompletionSet = 'CompletionSet',
  CompletionUpdate = 'CompletionUpdate',
  DebugSync = 'DebugSync',
  UpdateDownload = 'UpdateDownload',
  UpdateFinish = 'UpdateFinish',
  UpdateProgress = 'UpdateProgress',
  ToggleDarkMode = 'ToggleDarkMode',
  AddSelectionToChat = 'AddSelectionToChat',
  ReviewFileListUpdate = 'ReviewFileListUpdate',
  ReviewDataUpdate = 'ReviewDataUpdate',
  SwitchLocale = 'SwitchLocale',
  MainWindowActivePage = 'MainWindowActivePage',
  MainWindowCheckPageReady = 'MainWindowCheckPageReady',
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

export class AddSelectionToChatActionMessage implements ActionMessage {
  type = ActionType.AddSelectionToChat;
  data: Selection;
  constructor(data: Selection) {
    this.data = data;
  }
}

export class ReviewDataUpdateActionMessage implements ActionMessage {
  type = ActionType.ReviewDataUpdate;
  data: string[];

  constructor(reviewIdList: string[]) {
    this.data = reviewIdList;
  }
}

export class ReviewFileListUpdateActionMessage implements ActionMessage {
  type = ActionType.ReviewFileListUpdate;
  data: undefined;
  constructor() {}
}

export class SwitchLocaleActionMessage implements ActionMessage {
  type = ActionType.SwitchLocale;
  data: string;

  constructor(data: string) {
    this.data = data;
  }
}

export class MainWindowActivePageActionMessage implements ActionMessage {
  type = ActionType.MainWindowActivePage;
  data: MainWindowPageType;
  constructor(data: MainWindowPageType) {
    this.data = data;
  }
}

export class MainWindowCheckPageReadyActionMessage implements ActionMessage {
  type = ActionType.MainWindowCheckPageReady;
  data: MainWindowPageType;
  constructor(data: MainWindowPageType) {
    this.data = data;
  }
}

export interface ActionMessageMapping {
  [ActionType.CompletionClear]: CompletionClearActionMessage;
  [ActionType.CompletionSet]: CompletionSetActionMessage;
  [ActionType.CompletionUpdate]: CompletionUpdateActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
  [ActionType.UpdateDownload]: UpdateDownloadActionMessage;
  [ActionType.UpdateFinish]: UpdateFinishActionMessage;
  [ActionType.UpdateProgress]: UpdateProgressActionMessage;
  [ActionType.ToggleDarkMode]: ToggleDarkModeActionMessage;
  [ActionType.AddSelectionToChat]: AddSelectionToChatActionMessage;
  [ActionType.ReviewDataUpdate]: ReviewDataUpdateActionMessage;
  [ActionType.ReviewFileListUpdate]: ReviewFileListUpdateActionMessage;
  [ActionType.SwitchLocale]: SwitchLocaleActionMessage;
  [ActionType.MainWindowActivePage]: MainWindowActivePageActionMessage;
  [ActionType.MainWindowCheckPageReady]: MainWindowCheckPageReadyActionMessage;
}
