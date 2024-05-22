import { ProgressInfo } from 'electron-updater';
import {
  UpdateFinishActionMessage,
  UpdateProgressActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class UpdateWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Chat);
  }

  updateProgress(progressInfo: ProgressInfo) {
    this.sendMessageToRenderer(new UpdateProgressActionMessage(progressInfo));
  }

  updateFinish() {
    this.sendMessageToRenderer(new UpdateFinishActionMessage());
  }
}
