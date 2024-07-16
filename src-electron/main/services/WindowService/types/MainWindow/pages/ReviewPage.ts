import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { ReviewInstance } from 'main/components/ReviewInstance';

export class ReviewPage extends BasePage {
  activeReview?: ReviewInstance;
  constructor() {
    super(MainWindowPageType.Review);
  }
}
