import {
  api_code_review,
  api_get_code_review_result,
  api_get_code_review_state,
  api_stop_review,
} from 'main/request/review';
import { container } from 'main/services';
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
  ReviewType,
} from 'shared/types/review';
import { ServiceType } from 'shared/types/service';
import log from 'electron-log/main';
import { DataStoreService } from 'main/services/DataStoreService';
import { DateTime } from 'luxon';

const REFRESH_TIME = 3000;

export class ReviewInstance {
  timer?: NodeJS.Timeout;
  reviewId = '----';
  state: ReviewState = ReviewState.References;
  result?: ReviewResult;
  references: Reference[] = [];
  feedback = Feedback.None;
  errorInfo = '';
  createTime = DateTime.now().valueOf() / 1000;
  reviewType: ReviewType;
  createdCallback = () => {};

  constructor(
    private selection: Selection,
    private extraData: ExtraData,
    reviewType: ReviewType,
    createdCallback?: () => void,
  ) {
    this.reviewType = reviewType;
    this.createReviewRequest();
    if (createdCallback) {
      this.createdCallback = createdCallback;
    }
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
      this.createTime = DateTime.now().valueOf() / 1000;
      this.state = ReviewState.Start;
      this.timer = setInterval(() => {
        this.refreshReviewState();
      }, REFRESH_TIME);
    } catch (e) {
      log.error(e);
      this.state = ReviewState.Error;
      this.errorInfo = (e as Error).message;
      const windowService = container.get<WindowService>(ServiceType.WINDOW);
      const mainWindow = windowService.getWindow(WindowType.Main);
      mainWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(this.getReviewData()),
      );
    }
    this.createdCallback();
  }

  async refreshReviewState() {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    try {
      this.state = await api_get_code_review_state(this.reviewId);
      if (
        this.state === ReviewState.Third ||
        this.state === ReviewState.Finished
      ) {
        clearInterval(this.timer);
        await this.getReviewResult();
        this.state = ReviewState.Finished;
        this.saveReviewData();
      }
      if (this.state === ReviewState.Error) {
        clearInterval(this.timer);
        await this.getReviewResult();
        this.errorInfo = this.result ? this.result.originData : '';
        this.saveReviewData();
      }
      mainWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(this.getReviewData()),
      );
    } catch (error) {
      log.error(error);
      clearInterval(this.timer);
      this.state = ReviewState.Error;
      this.errorInfo = (error as Error).message;
      mainWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage(this.getReviewData()),
      );
      this.saveReviewData();
    }
  }

  async getReviewResult() {
    this.result = await api_get_code_review_result(this.reviewId);
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
      extraData: this.extraData,
    } as ReviewData;
  }

  async stop() {
    clearInterval(this.timer);
    if (this.state === ReviewState.Start) {
      try {
        await api_stop_review(this.reviewId);
      } catch (e) {
        log.error('stopReview.failed', e);
      }
    }
    this.state = ReviewState.Error;
    this.errorInfo = 'USER STOPPED REVIEW TASK';
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    mainWindow.sendMessageToRenderer(
      new ReviewDataUpdateActionMessage(this.getReviewData()),
    );
  }
}
