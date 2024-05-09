import { ProgressInfo } from 'electron-updater';
import { sendToRenderer } from 'preload/types/ActionApi';
import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import {
  UpdateFinishActionMessage,
  UpdateProgressActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';

export class UpdateWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Chat);
  }

  updateProgress(progressInfo: ProgressInfo) {
    if (this._window) {
      sendToRenderer(
        this._window,
        new UpdateProgressActionMessage(progressInfo),
      );
    }
  }

  updateFinish() {
    if (this._window) {
      sendToRenderer(this._window, new UpdateFinishActionMessage());
    }
  }
}
