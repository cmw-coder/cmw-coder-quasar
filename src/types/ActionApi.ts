import { ActionMessageMapping } from 'shared/types/ActionMessage';

export class ActionApi {
  private readonly _baseName: string;
  private _registeredActionTypes: Set<keyof ActionMessageMapping> = new Set();

  constructor(baseName: string) {
    this._baseName = baseName;
  }

  register<T extends keyof ActionMessageMapping>(
    actionType: T,
    callback: (data: ActionMessageMapping[T]['data']) => void,
  ): void {
    window.actionApi.register(
      actionType,
      this._baseName + actionType,
      callback,
    );
    this._registeredActionTypes.add(actionType);
  }

  unregister(): void {
    for (const registeredActionType of this._registeredActionTypes) {
      window.actionApi.unregister(
        registeredActionType,
        this._baseName + registeredActionType,
      );
    }
    this._registeredActionTypes.clear();
  }
}
