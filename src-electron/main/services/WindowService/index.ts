import { BrowserWindow, app, screen } from 'electron';
import log from 'electron-log/main';
import { readFile } from 'fs/promises';
import { decode } from 'iconv-lite';
import { inject, injectable } from 'inversify';
import Parser from 'web-tree-sitter';
import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { WindowServiceTrait } from 'shared/types/service/WindowServiceTrait';
import { NetworkZone } from 'shared/config';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { defaultAppData } from 'shared/types/service/DataStoreServiceTrait/types';
import { FeedbackWindow } from 'main/services/WindowService/types/FeedbackWindow';
import { ProjectIdWindow } from 'main/services/WindowService/types/ProjectIdWindow';
import { WelcomeWindow } from 'main/services/WindowService/types/WelcomeWindow';
import { LoginWindow } from 'main/services/WindowService/types/LoginWindow';
import { CompletionsWindow } from 'main/services/WindowService/types/CompletionsWindow';
import { MainWindow } from 'main/services/WindowService/types/MainWindow';
import { UpdateWindow } from 'main/services/WindowService/types/UpdateWindow';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { ConfigService } from 'main/services/ConfigService';
import { DataStoreService } from 'main/services/DataStoreService';
import { WebsocketService } from 'main/services/WebsocketService';

import { SelectionTipsWindow } from 'main/services/WindowService/types/SelectionTipsWindow';
import { ExtraData, Selection } from 'shared/types/Selection';
import { ReviewInstance } from 'main/components/ReviewInstance';
import { Feedback, ReviewData, ReviewType } from 'shared/types/review';
import { ReviewDataListUpdateActionMessage } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { Range } from 'main/types/vscode/range';
import { container, getService } from 'main/services';
import { treeSitterFolder } from 'main/services/WindowService/constants';
import { DateTime } from 'luxon';
import { api_reportSKU } from 'main/request/sku';

interface WindowMap {
  [WindowType.Completions]: CompletionsWindow;
  [WindowType.Feedback]: FeedbackWindow;
  [WindowType.Login]: LoginWindow;
  [WindowType.Main]: MainWindow;
  [WindowType.ProjectId]: ProjectIdWindow;
  [WindowType.Quake]: MainWindow;
  [WindowType.Update]: UpdateWindow;
  [WindowType.Welcome]: WelcomeWindow;
  [WindowType.SelectionTips]: SelectionTipsWindow;
}

@injectable()
export class WindowService implements WindowServiceTrait {
  trayIcon: TrayIcon;
  windowMap = new Map<WindowType, BaseWindow>();

  private _parserInitialized = false;

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
    @inject(ServiceType.DATA_STORE)
    private _dataStoreService: DataStoreService,
  ) {
    Parser.init().then(() => (this._parserInitialized = true));
    this.windowMap.set(WindowType.Feedback, new FeedbackWindow());
    this.windowMap.set(WindowType.ProjectId, new ProjectIdWindow());
    this.windowMap.set(WindowType.Welcome, new WelcomeWindow());
    this.windowMap.set(WindowType.Login, new LoginWindow());
    this.windowMap.set(WindowType.Completions, new CompletionsWindow());
    this.windowMap.set(WindowType.Main, new MainWindow());
    this.windowMap.set(WindowType.Quake, new MainWindow());
    this.windowMap.set(WindowType.Update, new UpdateWindow());
    this.windowMap.set(WindowType.SelectionTips, new SelectionTipsWindow());

    this.trayIcon = new TrayIcon();

    this.trayIcon.onClick(() => this.getWindow(WindowType.Main).show());
    this.trayIcon.registerMenuEntry(MenuEntry.Feedback, () =>
      this.getWindow(WindowType.Feedback).show(),
    );
    this.trayIcon.registerMenuEntry(MenuEntry.Quit, () => app.exit());
  }

  getWindow<T extends WindowType>(type: T): WindowMap[T] {
    return this.windowMap.get(type) as WindowMap[T];
  }

  async setWindowSize(
    size: {
      width: number;
      height: number;
    },
    type?: WindowType,
  ): Promise<void> {
    let window: BrowserWindow | null | undefined;
    if (type) {
      window = this.getWindow(type)._window;
    } else {
      window = BrowserWindow.getFocusedWindow();
    }
    if (window) {
      console.log('setWindowSize', type, size);
      window.setSize(size.width, size.height);
    }
  }

  async closeWindow(type?: WindowType): Promise<void> {
    if (type) {
      const window = this.getWindow(type);
      window.destroy();
    } else {
      const focusWindow = BrowserWindow.getFocusedWindow();
      if (focusWindow) {
        focusWindow.destroy();
      }
    }
  }

  async hideWindow(type?: WindowType | undefined): Promise<void> {
    if (type) {
      const window = this.getWindow(type);
      window._window?.hide();
    } else {
      const focusWindow = BrowserWindow.getFocusedWindow();
      if (focusWindow) {
        focusWindow.hide();
      }
    }
  }

  async toggleMaximizeWindow(type?: WindowType): Promise<void> {
    let window: BrowserWindow | null | undefined;
    if (type) {
      window = this.getWindow(type)._window;
    } else {
      window = BrowserWindow.getFocusedWindow();
    }
    if (window) {
      window.isMaximized() ? window.unmaximize() : window.maximize();
    }
  }

  async defaultWindowSize(type: WindowType): Promise<void> {
    let window: BrowserWindow | null | undefined;
    if (type) {
      window = this.getWindow(type)._window;
    } else {
      window = BrowserWindow.getFocusedWindow();
    }
    if (window) {
      const defaultWindowSize = defaultAppData.window[type];
      window.setSize(
        defaultWindowSize.width || 600,
        defaultWindowSize.height || 800,
      );
    }
  }

  async minimizeWindow(type?: WindowType): Promise<void> {
    let window: BrowserWindow | null | undefined;
    if (type) {
      window = this.getWindow(type)._window;
    } else {
      window = BrowserWindow.getFocusedWindow();
    }
    if (window) {
      window.minimize();
    }
  }

  async finishLogin() {
    this.getWindow(WindowType.Login).show();
    this.getWindow(WindowType.Login).destroy();
  }

  async finishWelcome() {
    const config = await this._configService.getConfigs();
    if (config.networkZone === NetworkZone.Public && !config.token) {
      // 黄、绿区环境需要登录
      this.getWindow(WindowType.Login).show();
    } else {
      // 激活主窗口
      this.getWindow(WindowType.Main).show();
    }
    this.getWindow(WindowType.Welcome).destroy();
  }

  async getProjectIdWindowActiveProject(): Promise<string | undefined> {
    return this.getWindow(WindowType.ProjectId).project;
  }

  async getCommitWindowCurrentFile(): Promise<string | undefined> {
    const mainWindow = this.getWindow(WindowType.Main);
    const commitPage = mainWindow.getPage(MainWindowPageType.Commit);
    return commitPage.currentFile;
  }

  async activeWindow(type: WindowType): Promise<void> {
    this.getWindow(type).show();
  }

  async openDevTools(type?: WindowType): Promise<void> {
    let window: BrowserWindow | null | undefined;
    if (type) {
      window = this.getWindow(type)._window;
    } else {
      window = BrowserWindow.getFocusedWindow();
    }
    if (window) {
      window.webContents.openDevTools({ mode: 'undocked' });
    }
  }

  async mouseMoveInOrOutWindow(type: WindowType): Promise<void> {
    const baseWindow = this.getWindow(type);
    const window = baseWindow._window;
    if (baseWindow && window) {
      const { x, y, height, width } = window?.getBounds();
      const { x: mouseX, y: mouseY } = screen.getCursorScreenPoint();
      if (
        mouseX >= x &&
        mouseX <= x + width &&
        mouseY >= y &&
        mouseY <= y + height
      ) {
        // 鼠标在窗口中
        baseWindow.mouseIn();
      } else {
        baseWindow.mouseOut();
      }
    }
  }

  async setMainWindowPageReady(type: MainWindowPageType) {
    const mainWindow = this.getWindow(WindowType.Main);
    const page = mainWindow.getPage(type);
    page._readyResolveHandler();
  }

  async addSelectionToChat(selection?: Selection) {
    if (!selection) {
      selection = this.getWindow(WindowType.SelectionTips).selection;
    }
    if (!selection) {
      return;
    }
    console.log('addSelectionToChat', selection);
    const mainWindow = this.getWindow(WindowType.Main);
    const chatPage = mainWindow.getPage(MainWindowPageType.Chat);
    await chatPage.active();
    chatPage.addSelectionToChat(selection);
  }

  async reviewFile(path: string) {
    if (!this._parserInitialized) {
      return;
    }
    const clientInfo = getService(ServiceType.WEBSOCKET).getClientInfo();
    if (!clientInfo || !clientInfo.currentProject || !clientInfo.version) {
      return;
    }
    // 上报一次 FILE_REVIEW 使用
    const websocketService = container.get<WebsocketService>(
      ServiceType.WEBSOCKET,
    );
    const project = await websocketService.getProjectData();
    if (!project) {
      return;
    }
    const extraData: ExtraData = {
      projectId: project.id,
      version: clientInfo.version,
    };

    const appConfig = await this._configService.getConfigs();
    try {
      await api_reportSKU([
        {
          begin: DateTime.now().toMillis(),
          end: DateTime.now().toMillis(),
          count: 1,
          type: 'AIGC',
          product: 'SI',
          firstClass: 'FILE_REVIEW',
          secondClass: 'USE',
          skuName: '*',
          user: appConfig.username,
          userType: 'USER',
          subType: extraData.projectId,
          extra: extraData.version,
        },
      ]);
    } catch (e) {
      log.error('reportReviewUsage.failed', e);
    }
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    const content = decode(await readFile(path), 'gbk');
    try {
      const parser = new Parser();
      const language = await Parser.Language.load(
        `${treeSitterFolder}/tree-sitter-c.wasm`,
      );
      parser.setLanguage(language);
      const functionDefinitionQuery = language.query(
        '(function_definition) @definition',
      );
      const tree = parser.parse(content);
      const matches = functionDefinitionQuery.matches(tree.rootNode);
      log.debug('WindowService.reviewFile', { matches });
      const functionDefinitions = matches.map(
        ({ captures }): Selection => ({
          block: content.slice(
            captures[0].node.startIndex,
            captures[0].node.endIndex,
          ),
          file: path,
          content: content.slice(
            captures[0].node.startIndex,
            captures[0].node.endIndex,
          ),
          range: new Range(
            captures[0].node.startPosition.row,
            captures[0].node.startPosition.column,
            captures[0].node.endPosition.row,
            captures[0].node.endPosition.column,
          ),
          language: 'c',
        }),
      );
      log.debug('WindowService.reviewFile', { functionDefinitions });

      reviewPage.activeReviewList.push(
        ...functionDefinitions.map(
          (functionDefinition) =>
            new ReviewInstance(
              functionDefinition,
              {
                projectId: clientInfo.currentProject,
                version: clientInfo.version,
              },
              ReviewType.File,
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
        ),
      );
      await reviewPage.active();
      mainWindow.sendMessageToRenderer(
        new ReviewDataListUpdateActionMessage(
          reviewPage.activeReviewList.map((review) => review.getReviewData()),
        ),
      );
    } catch (error) {
      log.error(error);
      return;
    }
  }

  async reviewSelection(selection?: Selection) {
    const selectionTipsWindow = this.getWindow(WindowType.SelectionTips);
    const extraData = selectionTipsWindow.extraData;
    if (!extraData) {
      return;
    }
    if (!selection) {
      selection = selectionTipsWindow.selection;
    }
    if (!selection) {
      return;
    }
    // 上报一次 CODE_REVIEW 使用
    const appConfig = await this._configService.getConfigs();
    try {
      await api_reportSKU([
        {
          begin: DateTime.now().toMillis(),
          end: DateTime.now().toMillis(),
          count: 1,
          type: 'AIGC',
          product: 'SI',
          firstClass: 'CODE_REVIEW',
          secondClass: 'USE',
          skuName: '*',
          user: appConfig.username,
          userType: 'USER',
          subType: extraData.projectId,
          extra: extraData.version,
        },
      ]);
    } catch (e) {
      log.error('reportReviewUsage.failed', e);
    }
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    const reviewInstance = new ReviewInstance(
      selection,
      extraData,
      ReviewType.Function,
      () => {
        mainWindow.sendMessageToRenderer(
          new ReviewDataListUpdateActionMessage(
            reviewPage.activeReviewList.map((review) => review.getReviewData()),
          ),
        );
      },
    );
    reviewPage.activeReviewList.push(reviewInstance);

    await reviewPage.active();
    mainWindow.sendMessageToRenderer(
      new ReviewDataListUpdateActionMessage(
        reviewPage.activeReviewList.map((review) => review.getReviewData()),
      ),
    );
  }

  async getReviewData(): Promise<ReviewData[]> {
    const reviewPage = this.getWindow(WindowType.Main).getPage(
      MainWindowPageType.Review,
    );
    return reviewPage.activeReviewList.map((review) => review.getReviewData());
  }

  async delReview(reviewId: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    reviewPage.delReview(reviewId);
  }

  async setReviewFeedback(data: {
    reviewId: string;
    feedback: Feedback;
    extraData: ExtraData;
    createTime: number;
    comment?: string;
  }): Promise<void> {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    await reviewPage.setReviewFeedback(data);
  }

  async retryReview(reviewData: ReviewData) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    reviewPage.retryReview(reviewData);
  }

  async stopReview(reviewId: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    reviewPage.stopReview(reviewId);
  }

  async getWindowIsFixed(windowType: WindowType) {
    const { fixed } = this._dataStoreService.getWindowData(windowType);
    return !!fixed;
  }

  async toggleWindowFixed(windowType: WindowType) {
    const window = this.getWindow(windowType);
    window.toggleFixed();
  }
}
