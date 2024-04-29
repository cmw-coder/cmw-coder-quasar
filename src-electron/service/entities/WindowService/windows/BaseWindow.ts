import { BrowserWindow } from 'electron';
import Logger from 'electron-log';

import { WindowType, windowUrlMap } from 'shared/types/WindowType';

export abstract class BaseWindow {
  protected readonly _type: WindowType;
  protected _window: BrowserWindow | undefined;
  private _url: string;

  protected constructor(type: WindowType) {
    this._type = type;
    this._url = `${process.env.APP_URL}#${windowUrlMap[type]}`;
  }

  activate() {
    Logger.log(`Activate window: ${this._type} ${this._url}`);
    if (this._window) {
      this._window.show();
    } else {
      this._window = this.create();
      // 配置跨域
      this._window.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
          callback({
            responseHeaders: {
              'Access-Control-Allow-Origin': ['*'],
              'Access-Control-Allow-Headers': ['*'],
              ...details.responseHeaders,
            },
          });
        },
      );
      this._window.loadURL(this._url);
      this._window.once('ready-to-show', () => {
        if (this._window) {
          this._window.show();
          this._window.focus();
          if (process.env.NODE_ENV === 'development') {
            this._window.webContents.openDevTools();
          }
        }
      });
    }
  }

  destroy() {
    if (this._window) {
      this._window.destroy();
      this._window = undefined;
    }
  }

  protected abstract create(): BrowserWindow;
}
