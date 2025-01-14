import { container } from 'main/services';
import { WindowService } from 'main/services/WindowService';

import { MAIN_WINDOW_PAGE_URL_MAPPING } from 'shared/constants/common';
import {
  MainWindowActivePageActionMessage,
  MainWindowCheckPageReadyActionMessage,
} from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class BasePage {
  readonly _type: MainWindowPageType;
  readonly _url: string;
  _readyResolveHandler = () => {};
  constructor(type: MainWindowPageType) {
    this._type = type;
    this._url = MAIN_WINDOW_PAGE_URL_MAPPING[type];
  }

  async active() {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    mainWindow.show();
    // 向主窗口发消息激活路由
    mainWindow.sendMessageToRenderer(
      new MainWindowActivePageActionMessage(this._type),
    );
    await this.checkPageReady();
  }

  async checkPageReady() {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    return new Promise<void>((resolve) => {
      // 发送页面加载完毕确认信息
      mainWindow.sendMessageToRenderer(
        new MainWindowCheckPageReadyActionMessage(this._type),
      );
      this._readyResolveHandler = resolve;
    });
  }
}
