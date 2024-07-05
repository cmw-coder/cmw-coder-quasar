import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import Logger from 'electron-log';
import { ACTION_API_KEY, WINDOW_URL_MAPPING } from 'shared/constants/common';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { ActionMessageMapping } from 'shared/types/ActionMessage';
import log from 'electron-log/main';
import { resolve } from 'path';

export interface windowOptions extends BrowserWindowConstructorOptions {
  edgeHide?: boolean;
  storePosition?: boolean;
}

const defaultBrowserWindowConstructorOptions: windowOptions = {
  edgeHide: false,
  width: 800,
  height: 600,
  useContentSize: true,
  resizable: true,
  movable: true,
  minimizable: false,
  maximizable: false,
  closable: true,
  focusable: true,
  alwaysOnTop: true,
  fullscreenable: false,
  skipTaskbar: true,
  show: false,
  frame: false,
  transparent: false,
  storePosition: false,
  webPreferences: {
    // devTools: false,
    preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
  },
};

export abstract class BaseWindow {
  readonly _type: WindowType;
  _window: BrowserWindow | undefined;
  _url: string;
  private isInEdgeState = false;

  protected constructor(
    type: WindowType,
    private options?: windowOptions,
  ) {
    this._type = type;
    this._url = `${process.env.APP_URL}#${WINDOW_URL_MAPPING[type]}`;
  }

  create() {
    Logger.log(`Create window: ${this._type} ${this._url}`);

    this._window = new BrowserWindow({
      ...defaultBrowserWindowConstructorOptions,
      ...this.options,
    });

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
    this._window.loadURL(this._url).catch((e) => log.warn('loadURL', e));

    this.afterCreated();

    return this._window;
  }

  afterCreated() {
    if (!this._window) {
      return;
    }
    const dataStoreService = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    );
    this._window.once('ready-to-show', () => {
      if (this._window) {
        if (process.env.NODE_ENV === 'development') {
          this._window.webContents.openDevTools({ mode: 'detach' });
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
        this.moveHandler();
      }
    });
    this._window.on('closed', () => {
      this._window = undefined;
    });
    this._window.on('show', () => {
      const windowData = dataStoreService.getWindowData(this._type);
      windowData.show = true;
      dataStoreService.saveWindowData(this._type, windowData);
    });
    this._window.on('hide', () => {
      const windowData = dataStoreService.getWindowData(this._type);
      windowData.show = false;
      dataStoreService.saveWindowData(this._type, windowData);
    });
  }

  destroy() {
    if (this._window) {
      this._window.destroy();
      this._window = undefined;
    }
  }

  show(_windowData?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  }) {
    Logger.log(`Show window: ${this._type} ${this._url}`);
    this.isInEdgeState = false;
    const dataStoreService = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    );
    if (!this._window) {
      this._window = this.create();
    }

    const storedWindowData = dataStoreService.getWindowData(this._type);
    const { x, y, height, width } = {
      ...storedWindowData,
      ..._windowData,
    };
    // 设置窗口尺寸
    if (height && width) {
      this._window.setSize(width, height);
    }
    // 设置窗口位置
    if (x && y && this.options?.storePosition) {
      this._window.setPosition(x, y);
    } else {
      this._window.center();
    }
    this._window.show();
    if (this.isInEdgeState) {
      this.edgeShow();
    }
  }

  hide() {
    if (this._window) {
      this._window.hide();
    }
  }

  sendMessageToRenderer<T extends keyof ActionMessageMapping>(
    message: ActionMessageMapping[T],
  ): void {
    if (!this._window) {
      return;
    }
    this._window.webContents.send(ACTION_API_KEY, message);
  }

  moveHandler() {
    if (!this._window) {
      return;
    }
    const [x, y] = this._window.getPosition();
    if (this.options?.storePosition) {
      const dataStoreService = container.get<DataStoreService>(
        ServiceType.DATA_STORE,
      );
      const windowData = dataStoreService.getWindowData(this._type);
      windowData.x = x;
      windowData.y = y;
      dataStoreService.saveWindowData(this._type, windowData);
    }
    if (this.options?.edgeHide) {
      const { y: yBound } = this._window.getBounds();
      this.isInEdgeState = yBound <= 0;
    }
  }

  mouseIn() {
    if (this.isInEdgeState) {
      this.edgeShow();
    }
  }

  mouseOut() {
    if (this.isInEdgeState) {
      this.edgeHide();
    }
  }

  edgeHide() {
    if (!this._window) return;
    const bounds = this._window.getBounds();
    const { x, width, height } = bounds;
    let { y } = bounds;
    const yEnd = y + height;
    if (yEnd > 10) {
      y -= yEnd - 10;
      this._window.setBounds(
        { x: x, y: y, width: width, height: height },
        true,
      );
    }
  }

  edgeShow() {
    if (!this._window) return;
    const bounds = this._window.getBounds();
    const { x, width, height } = bounds;
    let { y } = bounds;
    if (y < 0) {
      y = 0;
    }
    this._window.setBounds({ x: x, y: y, width: width, height: height }, true);
  }
}
