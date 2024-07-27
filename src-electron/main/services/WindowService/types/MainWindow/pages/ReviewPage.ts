import { DateTime } from 'luxon';
import { ReviewInstance } from 'main/components/ReviewInstance';
import { api_reportSKU } from 'main/request/sku';
import { container, getService } from 'main/services';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { Feedback, ReviewData } from 'shared/types/review';
import { ExtraData } from 'shared/types/Selection';
import { ServiceType } from 'shared/types/service';
import log from 'electron-log/main';
import { api_feedback_review } from 'main/request/review';
import { WindowType } from 'shared/types/WindowType';
import { WindowService } from 'main/services/WindowService';
import { ReviewDataListUpdateActionMessage } from 'shared/types/ActionMessage';

export class ReviewPage extends BasePage {
  activeReviewList: ReviewInstance[] = [];
  constructor() {
    super(MainWindowPageType.Review);
  }

  async setReviewFeedback({
    reviewId,
    feedback,
    extraData,
    createTime,
    comment,
  }: {
    reviewId: string;
    feedback: Feedback;
    extraData: ExtraData;
    createTime: number;
    comment?: string;
  }) {
    const appConfig = await getService(ServiceType.CONFIG).getConfigs();
    if (feedback === Feedback.Helpful) {
      try {
        await api_reportSKU([
          {
            begin: DateTime.now().toMillis(),
            end: DateTime.now().toMillis(),
            count: 1,
            type: 'AIGC',
            product: 'SI',
            firstClass: 'CODE_REVIEW',
            secondClass: 'LIKE',
            skuName: '*',
            user: appConfig.username,
            userType: 'USER',
            subType: extraData.projectId,
            extra: extraData.version,
          },
        ]);
      } catch (e) {
        log.error('reportReviewHelpful.api_reportSKU.failed', e);
      }
    } else {
      try {
        await api_reportSKU([
          {
            begin: DateTime.now().toMillis(),
            end: DateTime.now().toMillis(),
            count: 1,
            type: 'AIGC',
            product: 'SI',
            firstClass: 'CODE_REVIEW',
            secondClass: 'UNLIKE',
            skuName: '*',
            user: appConfig.username,
            userType: 'USER',
            subType: extraData.projectId,
            extra: extraData.version,
          },
        ]);
      } catch (e) {
        log.error('reportReviewUsage.api_reportSKU.failed', e);
      }
    }

    try {
      await api_feedback_review(
        reviewId,
        appConfig.username,
        Feedback.Helpful,
        createTime,
        comment || '',
      );
    } catch (e) {
      log.error('reportReviewHelpful.api_feedback_review.failed', e);
    }
  }

  async retryReview(reviewData: ReviewData) {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    // 先去除旧的
    reviewPage.activeReviewList = reviewPage.activeReviewList.filter(
      (review) => review.reviewId !== reviewData.reviewId,
    );
    // 再添加新的
    reviewPage.activeReviewList.push(
      new ReviewInstance(
        reviewData.selection,
        reviewData.extraData,
        reviewData.reviewType,
        () => {
          mainWindow.sendMessageToRenderer(
            new ReviewDataListUpdateActionMessage(
              reviewPage.activeReviewList.map((review) =>
                review.getReviewData(),
              ),
            ),
          );
        },
      ),
    );
    // 同步数据
    mainWindow.sendMessageToRenderer(
      new ReviewDataListUpdateActionMessage(
        reviewPage.activeReviewList.map((review) => review.getReviewData()),
      ),
    );
  }

  stopReview(reviewId: string) {
    const review = this.activeReviewList.find(
      (review) => review.reviewId === reviewId,
    );
    if (review) {
      review.stop();
    }
  }

  delReview(reviewId: string) {
    const review = this.activeReviewList.find(
      (review) => review.reviewId === reviewId,
    );
    if (review) {
      review.stop();
    }
    this.activeReviewList = this.activeReviewList.filter(
      (review) => review.reviewId !== reviewId,
    );
  }
}
