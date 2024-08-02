import { ReviewInstance } from 'main/components/ReviewInstance';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ReviewSubProcess } from 'main/services/WindowService/types/MainWindow/pages/ReviewPage/ReviewSubProcess';

export class ReviewPage extends BasePage {
  private activeReviewList: ReviewInstance[] = [];
  private _reviewSubProcess = new ReviewSubProcess();
  get reviewSubProcess() {
    return this._reviewSubProcess;
  }
  constructor() {
    super(MainWindowPageType.Review);
  }
}
