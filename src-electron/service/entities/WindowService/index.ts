import { BrowserWindow, app } from 'electron';
import { inject, injectable } from 'inversify';
import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { WindowServiceBase } from 'shared/services/types/WindowServiceInterBase';
import { LoginWindow } from 'service/entities/WindowService/windows/LoginWindow';
import { StartSettingWindow } from 'service/entities/WindowService/windows/StartSettingWindow';
import { CompletionsWindow } from 'service/entities/WindowService/windows/CompletionsWindow';
import { MainWindow } from 'service/entities/WindowService/windows/MainWindow';
import { NetworkZone } from 'shared/config';
import { ServiceType } from 'shared/services';
import { ConfigService } from 'service/entities/ConfigService';
import { WindowType } from 'shared/types/WindowType';
import { FeedbackWindow } from 'service/entities/WindowService/windows/FeedbackWindow';
import { CommitWindow } from 'service/entities/WindowService/windows/CommitWindow';
import { SettingWindow } from 'service/entities/WindowService/windows/SettingWindow';
import { ProjectIdWindow } from 'service/entities/WindowService/windows/ProjectIdWindow';
import { ChatWindow } from 'service/entities/WindowService/windows/ChatWindow';
import { BaseWindow } from 'service/entities/WindowService/windows/BaseWindow';
import { defaultAppData } from 'shared/types/AppData';
import { UpdateWindow } from 'service/entities/WindowService/windows/UpdateWindow';

interface WindowMap {
  [WindowType.Chat]: ChatWindow;
  [WindowType.Commit]: CommitWindow;
  [WindowType.Feedback]: FeedbackWindow;
  [WindowType.ProjectId]: ProjectIdWindow;
  [WindowType.Setting]: SettingWindow;
  [WindowType.StartSetting]: StartSettingWindow;
  [WindowType.Login]: LoginWindow;
  [WindowType.Completions]: CompletionsWindow;
  [WindowType.Main]: MainWindow;
  [WindowType.Update]: UpdateWindow;
  [WindowType.Quake]: MainWindow;
  [WindowType.WorkFlow]: MainWindow;
}

@injectable()
export class WindowService implements WindowServiceBase {
  trayIcon: TrayIcon;
  windowMap = new Map<WindowType, BaseWindow>();

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
  ) {
    this.windowMap.set(WindowType.Chat, new ChatWindow());
    this.windowMap.set(WindowType.Commit, new CommitWindow());
    this.windowMap.set(WindowType.Feedback, new FeedbackWindow());
    this.windowMap.set(WindowType.ProjectId, new ProjectIdWindow());
    this.windowMap.set(WindowType.Setting, new SettingWindow());
    this.windowMap.set(WindowType.StartSetting, new StartSettingWindow());
    this.windowMap.set(WindowType.Login, new LoginWindow());
    this.windowMap.set(WindowType.Completions, new CompletionsWindow());
    this.windowMap.set(WindowType.Main, new MainWindow());
    this.windowMap.set(WindowType.Quake, new MainWindow());
    this.windowMap.set(WindowType.WorkFlow, new MainWindow());
    this.windowMap.set(WindowType.Update, new UpdateWindow());

    this.trayIcon = new TrayIcon();

    this.trayIcon.onClick(() => this.getWindow(WindowType.Main).activate());
    this.trayIcon.registerMenuEntry(MenuEntry.Feedback, () =>
      this.getWindow(WindowType.Feedback).activate(),
    );
    this.trayIcon.registerMenuEntry(MenuEntry.Settings, () => {
      this.getWindow(WindowType.Setting).activate();
    });
    this.trayIcon.registerMenuEntry(MenuEntry.Chat, () => {
      this.getWindow(WindowType.Chat).activate();
    });
    this.trayIcon.registerMenuEntry(MenuEntry.Quit, () => app.exit());
  }

  getWindow<T extends WindowType>(type: T): WindowMap[T] {
    return this.windowMap.get(type) as WindowMap[T];
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

  async finishStartSetting() {
    const config = await this._configService.getConfigs();
    if (config.networkZone === NetworkZone.Public && !config.token) {
      // 黄、绿区环境需要登录
      this.getWindow(WindowType.Login).activate();
    } else {
      // 激活主窗口
      this.getWindow(WindowType.Main).activate();
    }
    this.getWindow(WindowType.StartSetting).destroy();
  }

  async finishLogin() {
    this.getWindow(WindowType.Login).activate();
    this.getWindow(WindowType.Login).destroy();
  }

  async getProjectIdWindowActiveProject(): Promise<string | undefined> {
    return this.getWindow(WindowType.ProjectId).project;
  }

  async getCommitWindowCurrentFile(): Promise<string | undefined> {
    return this.getWindow(WindowType.Commit).currentFile;
  }

  async activeWindow(type: WindowType): Promise<void> {
    this.getWindow(type).activate();
  }
}
