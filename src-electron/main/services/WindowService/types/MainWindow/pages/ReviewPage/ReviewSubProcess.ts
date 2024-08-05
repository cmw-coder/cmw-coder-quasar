import {
  AppConfig,
  MessageToChildProxy,
  Reference,
  ReviewChildHandler,
  ReviewMasterHandler,
  Selection,
} from 'cmw-coder-subprocess';
import { app } from 'electron';
import Logger from 'electron-log/main';
import { container } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { WebsocketService } from 'main/services/WebsocketService';
import { WindowService } from 'main/services/WindowService';
import { reviewScriptPath } from 'main/services/WindowService/constants';
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
    super(reviewScriptPath, {
      historyDir: path.join(app.getPath('userData'), 'reviewHistoryV2'),
    });
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
}
