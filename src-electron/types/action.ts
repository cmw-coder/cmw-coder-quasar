export enum Action {
  CompletionGenerate = 'CompletionGenerate',
  Sync = 'Sync',
}

export interface ActionMessage {
  action: Action;
  data: never;
}

export class ActionMessage {
  constructor(action: Action, data: never) {
    this.action = action;
    this.data = data;
  }
}
