import {
  DisplayBalloonOptions,
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  Tray,
} from 'electron';
import log from 'electron-log/main';
import { resolve } from 'path';

import { MenuEntry } from 'main/components/TrayIcon/types';
import packageJson from 'root/package.json';

export class TrayIcon {
  private readonly _icon = nativeImage.createFromPath(
    resolve(
      __dirname,
      process.env.PROD
        ? 'favicons/light.ico'
        : '../../public/favicons/light.ico',
    ),
  );
  private _menuEntryMap = new Map<MenuEntry, () => void>();
  private _tray: Tray | undefined;
  private _trayClickCallback: () => void = () => log.info('Tray clicked');

  activate() {
    if (!this._tray) {
      this.create();
    }
  }

  notify(options: DisplayBalloonOptions) {
    this._tray?.displayBalloon({
      ...options,
      icon: this._icon,
    });
  }

  registerMenuEntry(entry: MenuEntry, callback: () => void) {
    this._menuEntryMap.set(entry, callback);
  }

  onClick(callback: () => void) {
    this._trayClickCallback = callback;
  }

  private create() {
    this._tray = new Tray(this._icon);
    this._tray.on('click', this._trayClickCallback);
    const contextMenu = Menu.buildFromTemplate([
      this._createNormalItem(MenuEntry.About, 'About'),
      this._createNormalItem(MenuEntry.Feedback, 'Feedback'),
      { type: 'separator' },
      this._createNormalItem(MenuEntry.Quit, 'Quit'),
    ]);
    this._tray.displayBalloon({
      icon: this._icon,
      title: `Comware Coder v${packageJson.version}`,
      content: '点击托盘图标来打开应用窗口',
    });
    this._tray.setContextMenu(contextMenu);
    this._tray.setToolTip(`Comware Coder v${packageJson.version}`);
  }

  private _createNormalItem(
    menuEntry: MenuEntry,
    label: string,
  ): MenuItemConstructorOptions {
    return {
      label,
      type: 'normal',
      click: () => this._menuEntryMap.get(menuEntry)?.(),
    };
  }
}
