import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class ReviewWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Review, {
      edgeHide: true,
      storePosition: true,
    });
  }
}
