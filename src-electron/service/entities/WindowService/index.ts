import { injectable } from 'inversify';
import { FloatingWindow } from 'main/windows/FloatingWindow';
import { ImmersiveWindow } from 'main/windows/ImmersiveWindow';
import { MainWindow } from 'main/windows/MainWindow';
import { WindowServiceBase } from 'shared/service-interface/WindowServiceInterBase';
import { TrayIcon } from 'main/components/TrayIcon';
import { initWindowDestroyInterval } from 'main/init';
import { app } from 'electron';
import { MenuEntry } from 'main/components/TrayIcon/types';

@injectable()
export class WindowService implements WindowServiceBase {
  floatingWindow: FloatingWindow;
  immersiveWindow: ImmersiveWindow;
  mainWindow: MainWindow;
  trayIcon: TrayIcon;
  immersiveWindowDestroyInterval: NodeJS.Timeout;

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
  }

  public sayHello(): void {
    console.log('Hello from WindowService');
  }
}
