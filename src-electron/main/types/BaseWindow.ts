import { BrowserWindow } from 'electron';

import { WindowType } from 'shared/types/WindowType';

/**
 * @deprecated
 */
export abstract class BaseWindow {
  protected readonly _type: WindowType;
  protected _window: BrowserWindow | undefined;

  protected constructor(type: WindowType) {
    this._type = type;
  }

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  destroy() {
    if (this._window) {
      this._window.destroy();
      this._window = undefined;
    }
  }

  protected abstract create(): void;
}
