import { BrowserWindow, screen } from 'electron';
import { BaseWindow } from 'service/entities/WindowService/windows/BaseWindow';
import { WindowType } from 'shared/types/WindowType';
import { resolve } from 'path';
import { container } from 'service/index';
import type { DataStoreService } from 'service/entities/DataStoreService';
import { ServiceType } from 'shared/services';
import {
  CompletionClearActionMessage,
  CompletionSetActionMessage,
  CompletionUpdateActionMessage,
} from 'shared/types/ActionMessage';
import { sendToRenderer } from 'preload/types/ActionApi';
import log from 'electron-log/main';
import { fontSizeTable } from 'shared/constants';

export class CompletionsWindow extends BaseWindow {
  private destroyTimer?: NodeJS.Timeout;
  constructor() {
    super(WindowType.Completions);
  }

  protected create(): BrowserWindow {
    const { compatibility } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();

    const window = new BrowserWindow({
      width: compatibility.transparentFallback ? 0 : 3840,
      height: compatibility.transparentFallback ? 0 : 2160,
      minWidth: 0,
      minHeight: 0,
      useContentSize: true,
      resizable: true,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: false,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: !compatibility.transparentFallback,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    window.setAlwaysOnTop(true, 'pop-up-menu');
    window.setIgnoreMouseEvents(!compatibility.transparentFallback);
    return window;
  }

  completionClear() {
    if (this._window && this._window.isVisible()) {
      this._window.hide();
      sendToRenderer(this._window, new CompletionClearActionMessage());
    }
  }

  completionSelect(
    completion: string,
    count: { index: number; total: number },
    height: number,
    position: { x: number; y: number },
  ) {
    if (!this._window) {
      this._window = this.create();
    }
    if (this._window) {
      const { compatibility } = container
        .get<DataStoreService>(ServiceType.DATA_STORE)
        .getAppdata();
      let fontHeight = height;
      const lines = completion.split('\r\n');
      const longestLine = Math.max(...lines.map((line) => line.length));

      const fontSize = fontSizeTable[fontHeight]
        ? fontSizeTable[fontHeight] * fontHeight
        : -0.000000000506374957617199 * fontHeight ** 6 +
          0.000000123078838391882 * fontHeight ** 5 -
          0.0000118441038684185 * fontHeight ** 4 +
          0.000574698566099494 * fontHeight ** 3 -
          0.0147437317361461 * fontHeight ** 2 +
          1.09720488138051 * fontHeight;
      const windowSize = {
        width: Math.round(fontSize * longestLine),
        height: Math.round(lines.length * fontHeight),
      };
      if (compatibility.zoomFix) {
        fontHeight = screen.screenToDipPoint({ x: 0, y: height }).y;
        position = screen.screenToDipPoint(position);
      }
      this._window.setPosition(
        Math.round(position.x),
        Math.round(position.y),
        false,
      );
      this._window.setSize(windowSize.width, windowSize.height, false);

      sendToRenderer(
        this._window,
        new CompletionSetActionMessage({
          completion,
          count,
          fontHeight,
          fontSize,
        }),
      );
      this._window.show();
    } else {
      log.warn('Immersive window activate failed');
    }
  }

  completionUpdate(isDelete: boolean) {
    if (!this._window) {
      this.create();
    }
    if (this._window) {
      sendToRenderer(this._window, new CompletionUpdateActionMessage(isDelete));
      this._window.show();
    } else {
      log.warn('Immersive window activate failed');
    }
  }

  hide() {
    this._window?.hide();
  }

  show() {
    this._window?.show();
  }

  activate(): void {
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer);
    }
    this.destroyTimer = setTimeout(
      () => {
        this.destroy();
      },
      1000 * 60 * 30,
    );
    super.activate();
  }

  destroy(): void {
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer);
      this.destroyTimer = undefined;
    }
    super.destroy();
  }
}