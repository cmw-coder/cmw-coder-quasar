import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';
import { ReviewInstance } from 'main/components/ReviewInstance';

export class ReviewWindow extends FloatingBaseWindow {
  activeReview?: ReviewInstance;
  constructor() {
    super(WindowType.Review, {
      useEdgeHide: true,
      storePosition: true,
    });
  }
}
