import { BrowserWindow, app, screen } from 'electron';
import { dialog } from 'electron/main';
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
import { SelectionTipsWindow } from 'main/services/WindowService/types/SelectionTipsWindow';
import { Selection } from 'shared/types/Selection';
import { ReviewInstance } from 'main/components/ReviewInstance';
import {
  Feedback,
  ReviewState,
  ReviewType,
  ReviewTypeMapping,
} from 'shared/types/review';
import { ReviewDataUpdateActionMessage } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { Range } from 'main/types/vscode/range';
import { getService } from 'main/services';
import { treeSitterFolder } from 'main/services/WindowService/constants';

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

    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    // 上一个 review 尚未结束
    if (
      reviewPage.activeFileReview &&
      !reviewPage.activeFileReview
        .map((review) => review.state)
        .every((state) =>
          [ReviewState.Error, ReviewState.Finished].includes(state),
        )
    ) {
      if (mainWindow._window) {
        dialog.showMessageBox(mainWindow._window, {
          message: '存在进行中的 文件评审 任务',
        });
      }
      return;
    }

    const content = decode(await readFile(path), 'gbk');
    try {
      const parser = new Parser();
      parser.setLanguage(
        await Parser.Language.load(`${treeSitterFolder}/tree-sitter-c.wasm`),
      );
      const tree = parser.parse(content);
      log.debug('WindowService.reviewFile', { tree });
      const functionDefinitions = tree.rootNode.children
        .filter((node) => node.type === 'function_definition')
        .map(
          (node): Selection => ({
            block: content.slice(node.startIndex, node.endIndex),
            file: path,
            content: content.slice(node.startIndex, node.endIndex),
            range: new Range(
              node.startPosition.row,
              node.startPosition.column,
              node.endPosition.row,
              node.endPosition.column,
            ),
            language: 'c',
          }),
        );
      log.debug('WindowService.reviewFile', { functionDefinitions });
      reviewPage.activeFileReview = functionDefinitions.map(
        (functionDefinition, index) =>
          new ReviewInstance(
            functionDefinition,
            {
              projectId: clientInfo.currentProject,
              version: clientInfo.version,
            },
            ReviewType.File,
            index,
          ),
      );
      log.debug('WindowService.reviewFile', {
        activeFileReview: reviewPage.activeFileReview,
      });
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
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    // 上一个 review 尚未结束
    if (
      reviewPage.activeFunctionReview &&
      ![ReviewState.Error, ReviewState.Finished].includes(
        reviewPage.activeFunctionReview.state,
      )
    ) {
      const mainWindow = this.getWindow(WindowType.Main);
      if (mainWindow._window) {
        dialog.showMessageBox(mainWindow._window, {
          message: '存在进行中的 函数评审 任务',
        });
      }
      return;
    }

    reviewPage.activeFunctionReview = new ReviewInstance(
      selection,
      extraData,
      ReviewType.Function,
    );
    await reviewPage.active();
    mainWindow.sendMessageToRenderer(
      new ReviewDataUpdateActionMessage({
        type: reviewPage.activeFunctionReview.reviewType,
        data: reviewPage.activeFunctionReview.getReviewData(),
        index: reviewPage.activeFunctionReview.reviewIndex,
      }),
    );
  }

  async getReviewData<T extends ReviewType>(
    reviewType: T,
  ): Promise<ReviewTypeMapping[T]> {
    const reviewPage = this.getWindow(WindowType.Main).getPage(
      MainWindowPageType.Review,
    );
    if (reviewType === ReviewType.Function) {
      return <ReviewTypeMapping[T]>(
        reviewPage.activeFunctionReview?.getReviewData()
      );
    } else {
      return <ReviewTypeMapping[T]>(
        reviewPage.activeFileReview?.map((review) => review.getReviewData())
      );
    }
  }

  async setActiveReviewFeedback(
    feedback: Feedback,
    comment?: string,
  ): Promise<void> {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    const activeReview = reviewPage.activeFunctionReview;
    if (activeReview) {
      activeReview.feedback = feedback;
      activeReview.saveReviewData();
      mainWindow.sendMessageToRenderer(
        new ReviewDataUpdateActionMessage({
          type: activeReview.reviewType,
          data: activeReview.getReviewData(),
          index: activeReview.reviewIndex,
        }),
      );
      if (feedback === Feedback.Helpful) {
        activeReview.reportHelpful();
      } else if (feedback === Feedback.NotHelpful) {
        activeReview.reportUnHelpful(comment);
      }
    }
  }

  async retryActiveReview() {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    const activeReview = reviewPage.activeFunctionReview;
    if (activeReview) {
      activeReview.retry();
    }
  }

  async stopActiveReview() {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    const activeReview = reviewPage.activeFunctionReview;
    if (activeReview) {
      activeReview.stop();
    }
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
