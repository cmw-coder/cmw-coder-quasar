import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';
import { Selection } from 'shared/types/Selection';

export class ReviewWindow extends FloatingBaseWindow {
  selection?: Selection;
  constructor() {
    super(WindowType.Review, {
      edgeHide: true,
      storePosition: true,
    });
  }
}
