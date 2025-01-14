import { ProgressInfo } from 'electron-updater';

import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

import {
  UpdateFinishActionMessage,
  UpdateProgressActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class UpdateWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Update);
  }

  updateProgress(progressInfo: ProgressInfo) {
    this.sendMessageToRenderer(new UpdateProgressActionMessage(progressInfo));
  }

  updateFinish() {
    this.sendMessageToRenderer(new UpdateFinishActionMessage());
  }
}
