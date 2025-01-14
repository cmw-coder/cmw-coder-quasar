import {
  ExtraData,
  Feedback,
  ReviewData,
  SelectionData,
} from 'cmw-coder-subprocess';
import { BrowserWindow, app, dialog, screen } from 'electron';
import log from 'electron-log/main';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { dirname } from 'path';

import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { api_reportSKU } from 'main/request/sku';
import { getService } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { DataService } from 'main/services/DataService';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { CompletionsWindow } from 'main/services/WindowService/types/CompletionsWindow';
import { FeedbackWindow } from 'main/services/WindowService/types/FeedbackWindow';
import { LoginWindow } from 'main/services/WindowService/types/LoginWindow';
import { MainWindow } from 'main/services/WindowService/types/MainWindow';
import { ProjectIdWindow } from 'main/services/WindowService/types/ProjectIdWindow';
import { SelectionTipsWindow } from 'main/services/WindowService/types/SelectionTipsWindow';
import { StatusWindow } from 'main/services/WindowService/types/StatusWindow';
import { UpdateWindow } from 'main/services/WindowService/types/UpdateWindow';
import { WelcomeWindow } from 'main/services/WindowService/types/WelcomeWindow';

import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ServiceType } from 'shared/types/service';
import { NetworkZone } from 'shared/types/service/ConfigServiceTrait/types';
import { DEFAULT_APP_DATA } from 'shared/types/service/DataServiceTrait/constants';
import { WindowServiceTrait } from 'shared/types/service/WindowServiceTrait';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

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
  [WindowType.Status]: StatusWindow;
}

@injectable()
export class WindowService implements WindowServiceTrait {
  trayIcon: TrayIcon;
  windowMap = new Map<WindowType, BaseWindow>();

  private _parserInitialized = false;

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
    @inject(ServiceType.DATA)
    private _dataService: DataService,
  ) {
    this.windowMap.set(WindowType.Feedback, new FeedbackWindow());
    this.windowMap.set(WindowType.ProjectId, new ProjectIdWindow());
    this.windowMap.set(WindowType.Welcome, new WelcomeWindow());
    this.windowMap.set(WindowType.Login, new LoginWindow());
    this.windowMap.set(WindowType.Completions, new CompletionsWindow());
    this.windowMap.set(WindowType.Main, new MainWindow());
    // this.windowMap.set(WindowType.Quake, new MainWindow());
    this.windowMap.set(WindowType.Update, new UpdateWindow());
    this.windowMap.set(WindowType.SelectionTips, new SelectionTipsWindow());
    this.windowMap.set(WindowType.Status, new StatusWindow());

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
      const defaultWindowSize = DEFAULT_APP_DATA.window[type];
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
    const config = await this._configService.getStore();
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

  async getWindowIsFixed(windowType: WindowType) {
    const { fixed } = this._dataService.getWindowData(windowType);
    return !!fixed;
  }

  async toggleWindowFixed(windowType: WindowType) {
    const window = this.getWindow(windowType);
    window.toggleFixed();
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

  async addSelectionToChat(selectionData?: SelectionData) {
    if (!selectionData) {
      selectionData = this.getWindow(WindowType.SelectionTips).selectionData;
    }
    if (!selectionData) {
      return;
    }
    console.log('addSelectionToChat', selectionData);
    const mainWindow = this.getWindow(WindowType.Main);
    const chatPage = mainWindow.getPage(MainWindowPageType.Chat);
    await chatPage.active();
    await chatPage.addSelectionToChat(selectionData);
  }

  async reviewProject(filePath?: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const _filePath = filePath || app.getPath('userData');
    const basePath = dirname(_filePath);
    if (!mainWindow._window) {
      return;
    }
    const targetDirPathList = dialog.showOpenDialogSync(mainWindow._window, {
      defaultPath: basePath,
      properties: ['openDirectory'],
    });
    if (!targetDirPathList) {
      return;
    }
    const targetDirPath = targetDirPathList[0];
    const extraData = this._parseExtraData();
    if (!extraData) {
      return;
    }
    // 上报一次 PROJECT_REVIEW 使用
    const appConfig = await this._configService.getStore();
    try {
      await api_reportSKU([
        {
          begin: DateTime.now().toMillis(),
          end: DateTime.now().toMillis(),
          count: 1,
          type: 'AIGC',
          product: 'SI',
          firstClass: 'PROJECT_REVIEW',
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
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    reviewPage.reviewSubProcess.proxyFn
      .reviewProject({
        projectDirPath: targetDirPath,
        extraData,
      })
      .catch();
  }

  async reviewFile(path: string, reportSku = true) {
    if (!this._parserInitialized) {
      return;
    }
    const extraData = this._parseExtraData();
    if (!extraData) {
      return;
    }
    // 上报一次 FILE_REVIEW 使用
    if (reportSku) {
      const appConfig = await this._configService.getStore();
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
    }

    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    reviewPage.reviewSubProcess.proxyFn
      .reviewFile({
        filePath: path,
        extraData,
      })
      .catch();
  }

  async reviewSelection(selectionData?: SelectionData) {
    const selectionTipsWindow = this.getWindow(WindowType.SelectionTips);
    const extraData = selectionTipsWindow.extraData;
    if (!extraData) {
      return;
    }
    if (!selectionData) {
      selectionData = selectionTipsWindow.selectionData;
    }
    if (!selectionData) {
      return;
    }
    // 上报一次 CODE_REVIEW 使用
    const appConfig = await this._configService.getStore();
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
    reviewPage.reviewSubProcess.proxyFn
      .addReview({
        selectionData,
        extraData,
      })
      .catch();
    reviewPage.active().catch();
  }

  async getReviewData(): Promise<ReviewData[]> {
    const reviewPage = this.getWindow(WindowType.Main).getPage(
      MainWindowPageType.Review,
    );
    return reviewPage.reviewSubProcess.proxyFn.getReviewData();
  }

  async delReview(reviewId: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.delReview(reviewId);
  }

  async delReviewByFile(filePath: string): Promise<void> {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.delReviewByFile(filePath);
  }

  async setReviewFeedback(data: {
    serverTaskId: string;
    userId: string;
    feedback: Feedback;
    timestamp: number;
    comment: string;
  }): Promise<void> {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.setReviewFeedback(data);
  }

  async retryReview(reviewId: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.retryReview(reviewId);
  }

  async stopReview(reviewId: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.stopReview(reviewId);
  }

  async getReviewFileList() {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.getReviewFileList();
  }

  async getFileReviewList(filePath: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.getFileReviewList(filePath);
  }

  async clearReview() {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.clearReview();
  }

  async getReviewHistoryFiles() {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.getReviewHistoryFiles();
  }

  async getReviewFileContent(filePath: string) {
    const mainWindow = this.getWindow(WindowType.Main);
    const reviewPage = mainWindow.getPage(MainWindowPageType.Review);
    return reviewPage.reviewSubProcess.proxyFn.getReviewFileContent(filePath);
  }

  private _parseExtraData(): ExtraData | undefined {
    const clientInfo = getService(ServiceType.WEBSOCKET).getClientInfo();
    if (!clientInfo?.currentProject.length || !clientInfo?.version.length) {
      return;
    }
    const projectData = this._dataService.getProjectData(
      clientInfo.currentProject,
    );
    if (!projectData?.id.length) {
      return;
    }
    return {
      projectId: projectData.id,
      version: clientInfo.version,
    };
  }
}
