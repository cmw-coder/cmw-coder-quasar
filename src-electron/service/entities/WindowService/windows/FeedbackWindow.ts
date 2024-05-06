import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class FeedbackWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.WorkFlow);
  }
}
