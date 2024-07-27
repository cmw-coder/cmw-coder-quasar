import { resolve } from 'path';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { WindowType } from 'shared/types/WindowType';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { ChatPage } from 'main/services/WindowService/types/MainWindow/pages/ChatPage';
import { CommitPage } from 'main/services/WindowService/types/MainWindow/pages/CommitPage';
import { ReviewPage } from 'main/services/WindowService/types/MainWindow/pages/ReviewPage';
import { WorkFlowPage } from 'main/services/WindowService/types/MainWindow/pages/WorkFlowPage';
import { SettingPage } from 'main/services/WindowService/types/MainWindow/pages/SettingPage';
import { TransplantProjectPage } from 'main/services/WindowService/types/MainWindow/pages/TransplantProjectPage';

interface PageMap {
  [MainWindowPageType.Chat]: ChatPage;
  [MainWindowPageType.Commit]: CommitPage;
  [MainWindowPageType.Review]: ReviewPage;
  [MainWindowPageType.WorkFlow]: WorkFlowPage;
  [MainWindowPageType.Setting]: SettingPage;
  [MainWindowPageType.TransplantProject]: TransplantProjectPage;
}

export class MainWindow extends BaseWindow {
  pageMap = new Map<MainWindowPageType, BasePage>();
  constructor() {
    super(WindowType.Main, {
      useEdgeHide: true,
      storePosition: true,
      width: 600,
      height: 800,
      useContentSize: true,
      show: false,
      frame: false,
      webPreferences: {
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });
    this.pageMap.set(MainWindowPageType.Chat, new ChatPage());
    this.pageMap.set(MainWindowPageType.Commit, new CommitPage());
    this.pageMap.set(MainWindowPageType.Review, new ReviewPage());
    this.pageMap.set(MainWindowPageType.WorkFlow, new WorkFlowPage());
    this.pageMap.set(MainWindowPageType.Setting, new SettingPage());
    this.pageMap.set(
      MainWindowPageType.TransplantProject,
      new TransplantProjectPage(),
    );
  }

  getPage<T extends MainWindowPageType>(type: T): PageMap[T] {
    return this.pageMap.get(type) as PageMap[T];
  }
}
