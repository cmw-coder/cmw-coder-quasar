export enum Action {
  CompletionGenerate = 'CompletionGenerate',
  Sync = 'Sync',
}

export interface ActionMessage {
  action: Action;
  data: string;
}

export class ActionMessage {
  constructor(action: Action, data: string) {
    this.action = action;
    this.data = data;
  }
}
