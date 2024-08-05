import {
  AppConfig,
  Feedback,
  MessageToChildProxy,
  Reference,
  ReviewChildHandler,
  ReviewMasterHandler,
  ReviewRequestParams,
  ReviewResult,
  ReviewState,
  Selection,
} from 'cmw-coder-subprocess';
import { app } from 'electron';
import Logger from 'electron-log/main';
import {
  api_code_review,
  api_feedback_review,
  api_get_code_review_result,
  api_get_code_review_state,
  api_stop_review,
} from 'main/request/review';
import { container } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { WebsocketService } from 'main/services/WebsocketService';
import { WindowService } from 'main/services/WindowService';
import { cmwCoderSubprocessPath } from 'main/services/WindowService/constants';
import path from 'path';
import {
  ReviewDataUpdateActionMessage,
  ReviewFileListUpdateActionMessage,
} from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';

export class ReviewSubProcess
  extends MessageToChildProxy<ReviewChildHandler>
  implements ReviewMasterHandler
{
  constructor() {
    super(`${cmwCoderSubprocessPath}/dist/reviewManagerProcess.cjs`, {
      historyDir: path.join(app.getPath('userData'), 'reviewHistoryV2'),
    });
  }

  async getScriptDir(): Promise<string> {
    return cmwCoderSubprocessPath;
  }

  async getConfig(): Promise<AppConfig> {
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    return configService.getConfigs();
  }

  async log(...payloads: never[]): Promise<void> {
    Logger.log('[ReviewSubProcess]', ...payloads);
  }

  async getReferences(selection: Selection): Promise<Reference[]> {
    const websocketService = container.get<WebsocketService>(
      ServiceType.WEBSOCKET,
    );
    return websocketService.getCodeReviewReferences(selection);
  }

  async reviewDataUpdated(reviewId: string): Promise<void> {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    mainWindow.sendMessageToRenderer(
      new ReviewDataUpdateActionMessage(reviewId),
    );
  }

  async reviewFileListUpdated(): Promise<void> {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    mainWindow.sendMessageToRenderer(new ReviewFileListUpdateActionMessage());
  }

  async api_code_review(data: ReviewRequestParams): Promise<string> {
    return api_code_review(data);
  }

  async api_get_code_review_state(serverTaskId: string): Promise<ReviewState> {
    return api_get_code_review_state(serverTaskId);
  }

  async api_get_code_review_result(
    serverTaskId: string,
  ): Promise<ReviewResult> {
    return api_get_code_review_result(serverTaskId);
  }

  async api_stop_review(serverTaskId: string): Promise<unknown> {
    return api_stop_review(serverTaskId);
  }

  async api_feedback_review(data: {
    serverTaskId: string;
    userId: string;
    feedback: Feedback;
    timestamp: number;
    comment: string;
  }): Promise<unknown> {
    return api_feedback_review(data);
  }
}
