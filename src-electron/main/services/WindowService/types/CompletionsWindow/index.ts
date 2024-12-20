import { screen } from 'electron';
import log from 'electron-log';
import { resolve } from 'path';

import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import {
  CompletionClearActionMessage,
  CompletionSetActionMessage,
  CompletionUpdateActionMessage,
} from 'shared/types/ActionMessage';
import { GenerateType } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { timeout } from 'main/utils/common';
import { SimilarSnippetsProcess } from 'main/services/WindowService/types/CompletionsWindow/SimilarSnippetsSubprocess';
import { FileStructureAnalysisProcess } from 'main/services/WindowService/types/CompletionsWindow/FileStructureAnalysisProcessSubprocess';
import { DiffSubprocess } from 'main/services/WindowService/types/CompletionsWindow/DiffSubprocess';
import { getFontSize } from 'main/utils/completion';

const RE_CREATE_TIME = 1000 * 60 * 30;

export class CompletionsWindow extends BaseWindow {
  private _reCreateTimer?: NodeJS.Timeout;
  private _similarSnippetsSubprocess = new SimilarSnippetsProcess();
  private _fileStructureAnalysisProcessSubprocess =
    new FileStructureAnalysisProcess();
  private _diffSubprocess = new DiffSubprocess();

  get similarSnippetsSubprocess() {
    return this._similarSnippetsSubprocess;
  }

  get fileStructureAnalysisProcessSubprocess() {
    return this._fileStructureAnalysisProcessSubprocess;
  }

  get diffSubprocess() {
    return this._diffSubprocess;
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
    type: GenerateType,
    completion: string,
    count: { index: number; total: number },
    fontHeight: number,
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
      const lines = completion.split(NEW_LINE_REGEX);

      let scale = 1;
      if (compatibility.zoomFix) {
        fontHeight = screen.screenToDipPoint({ x: 0, y: fontHeight }).y;
        position = screen.screenToDipPoint(position);
        scale = screen.screenToDipPoint({ x: 1000, y: 0 }).x / 1000;
      }
      this._window.setPosition(
        Math.round(position.x),
        Math.round(position.y),
        false,
      );

      const fontSize = getFontSize(fontHeight);
      const codeHeight = lines.length * fontHeight + 16 * scale;
      const codeWidth =
        Math.max(...lines.map((line) => line.length)) * fontSize * 0.53 + 10 * scale;
      switch (type) {
        case GenerateType.Common: {
          this._window.setSize(
            Math.round(codeWidth),
            Math.round(codeHeight),
            false,
          );
          break;
        }
        case GenerateType.PasteReplace: {
          this._window.setSize(
            Math.max(360 * scale, Math.round(codeWidth + 30 * scale)),
            Math.round(codeHeight + 80 * scale),
            false,
          );
          break;
        }
      }

      this.sendMessageToRenderer(
        new CompletionSetActionMessage({
          completion,
          count,
          fontHeight,
          fontSize,
          type,
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
