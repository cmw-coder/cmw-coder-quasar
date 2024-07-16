import {
  api_code_review,
  api_feedback_review,
  api_get_code_review_result,
  api_get_code_review_state,
} from 'main/request/review';
import { container, getService } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { WebsocketService } from 'main/services/WebsocketService';
import { WindowService } from 'main/services/WindowService';
import { ReviewDataUpdateActionMessage } from 'shared/types/ActionMessage';
import { ExtraData, Selection } from 'shared/types/Selection';
import { WindowType } from 'shared/types/WindowType';
import {
  Feedback,
  Reference,
  ReviewData,
  ReviewResult,
  ReviewState,
} from 'shared/types/review';
import { ServiceType } from 'shared/types/service';
import log from 'electron-log/main';
import { DataStoreService } from 'main/services/DataStoreService';
import { DateTime } from 'luxon';
import { api_reportSKU } from 'main/request/sku';

const REFRESH_TIME = 1500;

export class ReviewInstance {
  timer?: NodeJS.Timeout;
  reviewId = '----';
  state: ReviewState = ReviewState.References;
  result?: ReviewResult;
  references: Reference[] = [];
  feedback = Feedback.None;
  errorInfo = '';

  constructor(
    private selection: Selection,
    private extraData: ExtraData,
  ) {
    this.createReviewRequest();
    // 上报一次 review 使用
    this.reportReviewUsage();
  }

  async reportReviewUsage() {
    const appConfig = await getService(ServiceType.CONFIG).getConfigs();
    try {
      await api_reportSKU([
        {
          begin: Date.now(),
          end: Date.now(),
          count: 1,
          type: 'AIGC',
          product: 'SI',
          firstClass: 'CODE_REVIEW',
          secondClass: 'USE',
          skuName: '*',
          user: appConfig.username,
          userType: 'USER',
          subType: this.extraData.projectId,
          extra: this.extraData.version,
        },
      ]);
    } catch (e) {
      log.error('reportReviewUsage.failed', e);
    }
  }

  async reportHelpful() {
    const appConfig = await getService(ServiceType.CONFIG).getConfigs();
    try {
      await api_reportSKU([
        {
          begin: Date.now(),
          end: Date.now(),
          count: 1,
          type: 'AIGC',
          product: 'SI',
          firstClass: 'CODE_REVIEW',
          secondClass: 'LIKE',
          skuName: '*',
          user: appConfig.username,
          userType: 'USER',
          subType: this.extraData.projectId,
          extra: this.extraData.version,
        },
      ]);
    } catch (e) {
      log.error('reportReviewHelpful.api_reportSKU.failed', e);
    }
    try {
      await api_feedback_review(
        this.reviewId,
        appConfig.username,
        Feedback.Helpful,
      );
    } catch (e) {
      log.error('reportReviewHelpful.api_feedback_review.failed', e);
    }
  }

  async reportUnHelpful() {
    const appConfig = await getService(ServiceType.CONFIG).getConfigs();
    try {
      await api_reportSKU([
        {
          begin: Date.now(),
          end: Date.now(),
          count: 1,
          type: 'AIGC',
          product: 'SI',
          firstClass: 'CODE_REVIEW',
          secondClass: 'UNLIKE',
          skuName: '*',
          user: appConfig.username,
          userType: 'USER',
          subType: this.extraData.projectId,
          extra: this.extraData.version,
        },
      ]);
    } catch (e) {
      log.error('reportReviewUsage.api_reportSKU.failed', e);
    }
    try {
      await api_feedback_review(
        this.reviewId,
        appConfig.username,
        Feedback.Helpful,
      );
    } catch (e) {
      log.error('reportReviewHelpful.api_feedback_review.failed', e);
    }
  }

  retry() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.state = ReviewState.References;
    this.feedback = Feedback.None;
    this.references = [];
    this.result = undefined;
    this.errorInfo = '';
    this.createReviewRequest();
  }

  async createReviewRequest() {
    const websocketService = container.get<WebsocketService>(
      ServiceType.WEBSOCKET,
    );
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    const appConfig = await configService.getConfigs();
    log.info('getCodeReviewReferences start');
    this.references = await websocketService.getCodeReviewReferences(
      this.selection,
    );
    log.info('getCodeReviewReferences end', this.references);
    this.state = ReviewState.References;
    try {
      this.reviewId = await api_code_review({
        productLine: appConfig.activeTemplate,
        profileModel: appConfig.activeModel,
        templateName: 'CodeReviewV1',
        references: this.references,
        target: {
          block: '',
          snippet: this.selection.content,
        },
        language: this.selection.language,
      });
      this.state = ReviewState.Start;
      this.timer = setInterval(() => {
        this.refreshReviewState();
      }, REFRESH_TIME);
    } catch (e) {
      log.error(e);
      this.state = ReviewState.Error;
      this.errorInfo = (e as Error).message;
      const windowService = container.get<WindowService>(ServiceType.WINDOW);
      const reviewWindow = windowService.getWindow(WindowType.Review);
      reviewWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(this.getReviewData()),
      );
    }
  }

  async refreshReviewState() {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const reviewWindow = windowService.getWindow(WindowType.Review);
    try {
      this.state = await api_get_code_review_state(this.reviewId);
      if (this.state === ReviewState.Third) {
        await this.getReviewResult();
        this.state = ReviewState.Finished;
        clearInterval(this.timer);
        this.saveReviewData();
      }
      if (this.state === ReviewState.Error) {
        await this.getReviewResult();
        this.errorInfo = this.result ? this.result.originData : '';
        clearInterval(this.timer);
        this.saveReviewData();
      }
      reviewWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(this.getReviewData()),
      );
    } catch (error) {
      log.error(error);
      clearInterval(this.timer);
      this.state = ReviewState.Error;
      this.errorInfo = (error as Error).message;
      reviewWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(this.getReviewData()),
      );
      this.saveReviewData();
    }
  }

  async getReviewResult() {
    this.result = await api_get_code_review_result(this.reviewId);
    console.log('getReviewResult', this.result);
  }

  saveReviewData() {
    const reviewData = this.getReviewData();
    const dataStoreService = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    );
    const now = DateTime.now();
    const nowStr = now.toFormat('yyyy-MM-dd');
    dataStoreService.localReviewHistoryManager.saveReviewItem(
      nowStr,
      reviewData,
    );
  }

  getReviewData() {
    return {
      reviewId: this.reviewId,
      state: this.state,
      result: this.result,
      references: this.references,
      selection: this.selection,
      feedback: this.feedback,
      errorInfo: this.errorInfo,
    } as ReviewData;
  }
}
