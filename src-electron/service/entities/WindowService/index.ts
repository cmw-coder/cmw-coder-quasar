import { app } from 'electron';
import { inject, injectable } from 'inversify';
import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { initWindowDestroyInterval } from 'main/init';
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

@injectable()
export class WindowService implements WindowServiceBase {
  floatingWindow: FloatingWindow;
  immersiveWindow: ImmersiveWindow;
  mainWindow: MainWindow;
  immersiveWindowDestroyInterval: NodeJS.Timeout;
  trayIcon: TrayIcon;

  // @new
  loginWindow: LoginWindow;
  startSettingWindow: StartSettingWindow;
  completionsWindow: CompletionsWindow;

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
  ) {
    this.floatingWindow = new FloatingWindow();
    this.immersiveWindow = new ImmersiveWindow();
    this.mainWindow = new MainWindow();

    this.immersiveWindowDestroyInterval = initWindowDestroyInterval(
      this.immersiveWindow,
    );

    this.trayIcon = new TrayIcon();

    this.trayIcon.onClick(() => this.mainWindow.activate());
    this.trayIcon.registerMenuEntry(MenuEntry.Feedback, () =>
      this.floatingWindow.feedback(),
    );
    this.trayIcon.registerMenuEntry(MenuEntry.Quit, () => app.exit());

    // @new
    this.loginWindow = new LoginWindow();
    this.startSettingWindow = new StartSettingWindow();
    this.completionsWindow = new CompletionsWindow();
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
}
