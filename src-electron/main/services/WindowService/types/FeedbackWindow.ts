import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class FeedbackWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Feedback);
  }
}
