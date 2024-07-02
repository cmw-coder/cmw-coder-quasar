import {
  api_code_review,
  api_get_code_review_result,
  api_get_code_review_state,
} from 'main/request/review';
import { container } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { WebsocketService } from 'main/services/WebsocketService';
import { Selection } from 'shared/types/Selection';
import { Reference, ReviewState } from 'shared/types/review';
import { ServiceType } from 'shared/types/service';

const REFRESH_TIME = 1500;

export class ReviewInstance {
  timer?: NodeJS.Timeout;
  reviewId = '----';
  state: ReviewState = ReviewState.References;
  result = '';
  references: Reference[] = [];

  constructor(private selection: Selection) {
    this.createReviewRequest();
  }

  async createReviewRequest() {
    const websocketService = container.get<WebsocketService>(
      ServiceType.WEBSOCKET,
    );
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    const appConfig = await configService.getConfigs();
    this.state = ReviewState.Start;
    this.references = await websocketService.getCodeReviewReferences(
      this.selection,
    );

    this.reviewId = await api_code_review({
      productLine: appConfig.activeTemplate,
      profileModel: appConfig.activeModel,
      templateName: '',
      references: this.references,
      target: {
        block: '',
        snippet: this.selection.content,
      },
    });
    this.state = ReviewState.First;

    this.timer = setInterval(() => {
      this.refreshReviewState();
    }, REFRESH_TIME);
  }

  async refreshReviewState() {
    this.state = await api_get_code_review_state(this.reviewId);
    if (this.state === ReviewState.Third || this.state === ReviewState.Error) {
      clearInterval(this.timer);
    }
    if (this.state === ReviewState.Third) {
      this.getReviewResult();
    }
  }

  async getReviewResult() {
    this.result = await api_get_code_review_result(this.reviewId);
  }
}
