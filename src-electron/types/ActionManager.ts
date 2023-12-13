import { Action, ActionMessage } from 'types/action';

export class ActionManager {
  private _handlers = new Map<Action, (message: ActionMessage) => void>();

  handleAction(message: ActionMessage) {
    this._handlers.get(message.action)?.(message);
  }

  registerAction(action: Action, callback: (message: ActionMessage) => void) {
    this._handlers.set(action, callback);
  }
}
