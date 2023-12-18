import { ipcRenderer } from 'electron';

export const actionApiKey = 'actionApi' as const;

export enum ActionType {
  CompletionInline = 'CompletionInline',
  CompletionSnippet = 'CompletionInline',
  DebugSync = 'DebugSync',
}

interface ActionMessage {
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

export interface ActionMessageMapping {
  [ActionType.CompletionInline]: CompletionInlineActionMessage;
  [ActionType.CompletionSnippet]: CompletionSnippetActionMessage;
  [ActionType.DebugSync]: DebugSyncActionMessage;
}

const handlerMap = new Map<ActionType, Array<(data: never) => void>>();

export const receive = <T extends keyof ActionMessageMapping>(
  actionType: T,
  callback: (data: ActionMessageMapping[T]['data']) => void
): void => {
  const handlers = handlerMap.get(actionType);
  if (handlers) {
    handlers.push(callback);
    return;
  } else {
    handlerMap.set(actionType, [callback]);
  }
};

export const send = <T extends keyof ActionMessageMapping>(
  message: ActionMessageMapping[T]
): void => {
  ipcRenderer.send(actionApiKey, message);
};

ipcRenderer.on(actionApiKey, (_, message: ActionMessage) => {
  handlerMap
    .get(message.type)
    ?.forEach((handler) => handler(<never>message.data));
});
