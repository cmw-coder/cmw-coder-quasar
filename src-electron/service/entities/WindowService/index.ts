import { app } from 'electron';
import { injectable } from 'inversify';

import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { initWindowDestroyInterval } from 'main/init';
import { FloatingWindow } from 'main/windows/FloatingWindow';
import { ImmersiveWindow } from 'main/windows/ImmersiveWindow';
import { MainWindow } from 'main/windows/MainWindow';
import { WindowServiceBase } from 'shared/services/types/WindowServiceInterBase';

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
}
