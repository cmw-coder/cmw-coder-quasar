import { DateTime } from 'luxon';
import { ReviewInstance } from 'main/components/ReviewInstance';
import { api_reportSKU } from 'main/request/sku';
import { container, getService } from 'main/services';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { Feedback, ReviewData, ReviewState } from 'shared/types/review';
import { ExtraData } from 'shared/types/Selection';
import { ServiceType } from 'shared/types/service';
import log from 'electron-log/main';
import { api_feedback_review } from 'main/request/review';
import { WindowType } from 'shared/types/WindowType';
import { WindowService } from 'main/services/WindowService';
import {
  ReviewDataListUpdateActionMessage,
  ReviewDataUpdateActionMessage,
} from 'shared/types/ActionMessage';

const MAX_RUNNING_REVIEW_COUNT = 10;

export class ReviewPage extends BasePage {
  private activeReviewList: ReviewInstance[] = [];
  constructor() {
    super(MainWindowPageType.Review);
  }

  get runningReviewList() {
    return this.activeReviewList.filter((review) => review.isRunning);
  }

  get reviewDataList() {
    return this.activeReviewList.map((review) => review.getReviewData());
  }

  async setReviewFeedback({
    serverTaskId,
    feedback,
    extraData,
    createTime,
    comment,
  }: {
    serverTaskId: string;
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
        serverTaskId,
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
    const review = this.activeReviewList.find(
      (review) => review.reviewId === reviewData.reviewId,
    );
    if (review) {
      await review.stop();
      review.start();
    }
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

  async addReview(review: ReviewInstance) {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    this.activeReviewList.push(review);
    review.onStart = () => {
      mainWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(review.getReviewData()),
      );
    };
    review.onUpdate = () => {
      mainWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(review.getReviewData()),
      );
    };
    review.onEnd = () => {
      mainWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(review.getReviewData()),
      );
      if (this.runningReviewList.length < MAX_RUNNING_REVIEW_COUNT) {
        // 跑下一个任务
        const queueReviewList = this.activeReviewList.filter(
          (_review) => _review.state === ReviewState.Queue,
        );
        if (queueReviewList.length > 0) {
          const nextReview = queueReviewList[0];
          nextReview.start();
        }
      }
    };
    if (this.runningReviewList.length < MAX_RUNNING_REVIEW_COUNT) {
      review.start();
    }
    mainWindow.sendMessageToRenderer(
      new ReviewDataListUpdateActionMessage(this.reviewDataList),
    );
  }
}
