import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  screen,
} from 'electron';
import Logger from 'electron-log';
import { resolve } from 'path';

import { container } from 'main/services';
import { DataService } from 'main/services/DataService';

import { ACTION_API_KEY, WINDOW_URL_MAPPING } from 'shared/constants/common';
import { ActionMessageMapping } from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export interface windowOptions extends BrowserWindowConstructorOptions {
  useEdgeHide?: boolean;
  storePosition?: boolean;
}

const defaultBrowserWindowConstructorOptions: windowOptions = {
  useEdgeHide: false,
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
  skipTaskbar: false,
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
  isEdgeHide = false;
  private isInEdgeState = false;
  private browserWindowOptions: windowOptions = {};

  protected constructor(
    type: WindowType,
    private options?: windowOptions,
  ) {
    this._type = type;
    this._url = `${process.env.APP_URL}#${WINDOW_URL_MAPPING[type]}`;
  }

  create() {
    Logger.log(`Create window: ${this._type} ${this._url}`);
    this.isEdgeHide = false;
    this.browserWindowOptions = {
      ...defaultBrowserWindowConstructorOptions,
      ...this.options,
    };

    this._window = new BrowserWindow(this.browserWindowOptions);
    if (this.browserWindowOptions.alwaysOnTop) {
      this._window.setAlwaysOnTop(true, 'pop-up-menu');
    } else {
      this._window.setAlwaysOnTop(false);
    }

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
    this._window.loadURL(this._url).catch((e) => Logger.warn('loadURL', e));

    this.afterCreated();

    return this._window;
  }

  afterCreated() {
    if (!this._window) {
      return;
    }
    const dataStoreService = container.get<DataService>(ServiceType.DATA);
    const windowData = dataStoreService.getWindowData(this._type);
    dataStoreService.saveWindowData(this._type, {
      ...windowData,
      fixed: !!this.browserWindowOptions.alwaysOnTop,
    });
    this._window.once('ready-to-show', () => {
      if (this._window) {
        if (process.env.NODE_ENV === 'development') {
          // this._window.webContents.openDevTools({ mode: 'detach' });
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

  show(
    _windowData?: {
      x?: number;
      y?: number;
      height?: number;
      width?: number;
    },
    focus = true,
  ) {
    Logger.log(`Show window: ${this._type} ${this._url}`);

    if (!this._window) {
      this._window = this.create();
    }
    // if (this.isEdgeHide) {
    //   this.edgeShow();
    // }

    const dataStoreService = container.get<DataService>(ServiceType.DATA);

    const storedWindowData = dataStoreService.getWindowData(this._type);
    const { x, y, height, width } = {
      ...storedWindowData,
      ..._windowData,
    };
    const _y = (y || 0) < 0 ? 0 : y || 0;
    const _x = (x || 0) < 0 ? 0 : x || 0;
    // 设置窗口尺寸
    if (height && width) {
      this._window.setSize(width, height);
    }
    // 设置窗口位置
    if (this.options?.storePosition) {
      // 检查窗口是否超出屏幕
      const { width: windowWidth, height: windowHeight } =
        screen.getPrimaryDisplay().workAreaSize;
      if (_x >= windowWidth || _y >= windowHeight) {
        this._window.center();
      } else {
        this._window.setPosition(_x, _y);
      }
    } else {
      this._window.center();
    }
    this._window.show();
    this._window.moveTop();
    if (focus) {
      this._window.focus();
    }
    this.moveHandler();
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
      const dataStoreService = container.get<DataService>(ServiceType.DATA);
      const windowData = dataStoreService.getWindowData(this._type);
      windowData.x = x;
      windowData.y = y;
      dataStoreService.saveWindowData(this._type, windowData);
    }
    if (this.options?.useEdgeHide) {
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
    this.moveHandler();
    this.isEdgeHide = true;
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
    this.moveHandler();
    this.isEdgeHide = false;
  }

  toggleFixed() {
    if (!this._window) return;
    const dataStoreService = container.get<DataService>(ServiceType.DATA);
    const windowData = dataStoreService.getWindowData(this._type);
    windowData.fixed = !windowData.fixed;
    if (windowData.fixed) {
      this._window.setAlwaysOnTop(true, 'pop-up-menu');
    } else {
      this._window.setAlwaysOnTop(false);
    }
    dataStoreService.saveWindowData(this._type, windowData);
  }
}
