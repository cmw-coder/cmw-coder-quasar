import { ReviewInstance } from 'main/components/ReviewInstance';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';

export class ReviewPage extends BasePage {
  activeFileReview?: ReviewInstance[];
  activeFunctionReview?: ReviewInstance;
  constructor() {
    super(MainWindowPageType.Review);
  }
}
