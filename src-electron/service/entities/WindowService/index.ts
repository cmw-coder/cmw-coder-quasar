import { BrowserWindow, app } from 'electron';
import { inject, injectable } from 'inversify';
import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { FloatingWindow } from 'main/windows/FloatingWindow';
import { ImmersiveWindow } from 'main/windows/ImmersiveWindow';
import { WindowServiceBase } from 'shared/services/types/WindowServiceInterBase';
import { LoginWindow } from 'service/entities/WindowService/windows/LoginWindow';
import { StartSettingWindow } from 'service/entities/WindowService/windows/StartSettingWindow';
import { CompletionsWindow } from 'service/entities/WindowService/windows/CompletionsWindow';
import { MainWindow } from 'service/entities/WindowService/windows/MainWindow';
import { NetworkZone } from 'shared/config';
import { ServiceType } from 'shared/services';
import { ConfigService } from 'service/entities/ConfigService';
import { FeedbackWindow } from 'service/entities/WindowService/windows/FeedbackWindow';
import { CommitWindow } from 'service/entities/WindowService/windows/CommitWindow';
import { ProjectIdWindow } from 'service/entities/WindowService/windows/ProjectIdWindow';
import { WindowType } from 'shared/types/WindowType';

@injectable()
export class WindowService implements WindowServiceBase {
  /**
   * @deprecated
   */
  floatingWindow: FloatingWindow;
  /**
   * @deprecated
   */
  immersiveWindow: ImmersiveWindow;
  mainWindow: MainWindow;
  trayIcon: TrayIcon;

  // @new
  loginWindow: LoginWindow;
  startSettingWindow: StartSettingWindow;
  commitWindow: CommitWindow;
  completionsWindow: CompletionsWindow;
  feedbackWindow: FeedbackWindow;
  projectIdWindow: ProjectIdWindow;

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
  ) {
    this.floatingWindow = new FloatingWindow();
    this.immersiveWindow = new ImmersiveWindow();
    this.mainWindow = new MainWindow();

    this.trayIcon = new TrayIcon();

    this.trayIcon.onClick(() => this.mainWindow.activate());
    this.trayIcon.registerMenuEntry(MenuEntry.Feedback, () =>
      this.feedbackWindow.activate(),
    );
    this.trayIcon.registerMenuEntry(MenuEntry.Quit, () => app.exit());

    // @new
    this.loginWindow = new LoginWindow();
    this.startSettingWindow = new StartSettingWindow();
    this.completionsWindow = new CompletionsWindow();
    this.feedbackWindow = new FeedbackWindow();
    this.commitWindow = new CommitWindow();
    this.projectIdWindow = new ProjectIdWindow();
  }

  async finishStartSetting() {
    const config = await this._configService.getConfigs();
    if (config.networkZone === NetworkZone.Public && !config.token) {
      // 黄、绿区环境需要登录
      this.loginWindow.activate();
    } else {
      // 激活主窗口
      this.mainWindow.activate();
    }
    this.startSettingWindow.destroy();
  }

  async finishLogin() {
    this.mainWindow.activate();
    this.loginWindow.destroy();
  }

  async closeWindow(type?: WindowType): Promise<void> {
    if (type) {
      switch (type) {
        case WindowType.Login:
          this.loginWindow.destroy();
          break;
        case WindowType.StartSetting:
          this.startSettingWindow.destroy();
          break;
        case WindowType.Completions:
          this.completionsWindow.destroy();
          break;
        case WindowType.Feedback:
          this.feedbackWindow.destroy();
          break;
        case WindowType.Commit:
          this.commitWindow.destroy();
          break;
        case WindowType.ProjectId:
          this.projectIdWindow.destroy();
          break;
        case WindowType.Main:
          this.mainWindow.destroy();
          break;
        case WindowType.Chat:
          this.mainWindow.destroy();
          break;
        case WindowType.WorkFlow:
          this.mainWindow.destroy();
          break;
        case WindowType.Setting:
          this.mainWindow.destroy();
          break;
        case WindowType.Quake:
          this.mainWindow.destroy();
          break;
        default:
          break;
      }
    } else {
      const focusWindow = BrowserWindow.getFocusedWindow();
      if (focusWindow) {
        focusWindow.destroy();
      }
    }
  }

  async getProjectIdWindowActiveProject(): Promise<string | undefined> {
    return this.projectIdWindow.project;
  }
}
