import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class FeedbackWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Feedback);
  }
}
