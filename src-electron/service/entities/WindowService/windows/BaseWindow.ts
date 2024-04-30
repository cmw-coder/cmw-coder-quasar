import { BrowserWindow } from 'electron';
import Logger from 'electron-log';
import type { DataStoreService } from 'service/entities/DataStoreService';
import { container } from 'service/index';
import { ServiceType } from 'shared/services';
import { WindowType, windowUrlMap } from 'shared/types/WindowType';

export abstract class BaseWindow {
  protected readonly _type: WindowType;
  protected _window: BrowserWindow | undefined;
  private _url: string;

  protected constructor(type: WindowType) {
    this._type = type;
    this._url = `${process.env.APP_URL}/#${windowUrlMap[type]}`;
  }

  activate() {
    Logger.log(`Activate window: ${this._type} ${this._url}`);
    const dataStoreService = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    );
    if (!this._window) {
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
      this._window.on('resized', () => {
        if (this._window) {
          const windowData = dataStoreService.getWindowData(this._type);
          const [width, height] = this._window.getSize();
          windowData.width = width;
          windowData.height = height;
          dataStoreService.saveWindowData(this._type, windowData);
        }
      });

      this._window.on('moved', () => {
        if (this._window) {
          const windowData = dataStoreService.getWindowData(this._type);
          const [x, y] = this._window.getPosition();
          windowData.x = x;
          windowData.y = y;
          dataStoreService.saveWindowData(this._type, windowData);
        }
      });
    }

    const { x, y, height, width } = dataStoreService.getWindowData(this._type);

    // 设置窗口尺寸
    if (height && width) {
      this._window.setSize(width, height);
    }
    // 设置窗口位置
    if (x && y) {
      this._window.setPosition(x, y);
    } else {
      this._window.center();
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
