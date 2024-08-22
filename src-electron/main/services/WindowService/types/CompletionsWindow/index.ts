import { screen } from 'electron';
import log from 'electron-log';
import { resolve } from 'path';

import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { FONT_SIZE_MAPPING, NEW_LINE_REGEX } from 'shared/constants/common';
import {
  CompletionClearActionMessage,
  CompletionSetActionMessage,
  CompletionUpdateActionMessage,
} from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { timeout } from 'main/utils/common';
import { SimilarSnippetsProcess } from 'main/services/WindowService/types/CompletionsWindow/SimilarSnippetsSubprocess';

const RE_CREATE_TIME = 1000 * 60 * 30;

export class CompletionsWindow extends BaseWindow {
  private _reCreateTimer?: NodeJS.Timeout;
  private _similarSnippetsSubprocess = new SimilarSnippetsProcess();

  get similarSnippetsSubprocess() {
    return this._similarSnippetsSubprocess;
  }

  constructor() {
    const { compatibility } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();
    super(WindowType.Completions, {
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
  }

  initReCreateTimer() {
    this._reCreateTimer = setInterval(() => {
      this.destroy();
      this.create();
    }, RE_CREATE_TIME);
  }

  afterCreated(): void {
    super.afterCreated();
    if (!this._window) {
      return;
    }
    const { compatibility } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();
    this._window.setIgnoreMouseEvents(!compatibility.transparentFallback);
  }

  completionClear() {
    if (this._window && this._window.isVisible()) {
      this._window.hide();
      this.sendMessageToRenderer(new CompletionClearActionMessage());
    }
  }

  async completionSelect(
    completion: string,
    count: { index: number; total: number },
    height: number,
    position: { x: number; y: number },
  ) {
    if (!this._window) {
      this.show();
      //TODO 确保渲染窗口成功加载且可接受消息数据, 当下用简单的延迟处理
      await timeout(2000);
    }
    if (this._window) {
      const { compatibility } = container
        .get<DataStoreService>(ServiceType.DATA_STORE)
        .getAppdata();
      let fontHeight = height;
      const lines = completion.split(NEW_LINE_REGEX);
      const longestLine = Math.max(...lines.map((line) => line.length));

      const fontSize = FONT_SIZE_MAPPING[fontHeight]
        ? FONT_SIZE_MAPPING[fontHeight] * fontHeight
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
      this.sendMessageToRenderer(
        new CompletionSetActionMessage({
          completion,
          count,
          fontHeight,
          fontSize,
        }),
      );
      this._window.show();
    } else {
      log.warn('Completion window activate failed');
    }
  }

  completionUpdate(isDelete: boolean) {
    if (!this._window) {
      this.create();
    }
    if (this._window) {
      this.sendMessageToRenderer(new CompletionUpdateActionMessage(isDelete));
      this._window.show();
    } else {
      log.warn('Completion window activate failed');
    }
  }
}
