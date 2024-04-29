import { app } from 'electron';
import { injectable } from 'inversify';

import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { initWindowDestroyInterval } from 'main/init';
import { FloatingWindow } from 'main/windows/FloatingWindow';
import { ImmersiveWindow } from 'main/windows/ImmersiveWindow';
import { MainWindow } from 'main/windows/MainWindow';
import { WindowServiceBase } from 'shared/services/types/WindowServiceInterBase';
import { LoginWindow } from 'service/entities/WindowService/windows/LoginWindow';
import { StartSettingWindow } from 'service/entities/WindowService/windows/StartSettingWindow';
import { CompletionsWindow } from 'service/entities/WindowService/windows/CompletionsWindow';

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

  constructor() {
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
}
