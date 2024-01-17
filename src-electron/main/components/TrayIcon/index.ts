import { Menu, MenuItemConstructorOptions, nativeImage, Tray } from 'electron';
import { resolve } from 'path';

import { MenuEntry } from 'main/components/TrayIcon/types';
import packageJson from 'root/package.json';

export class TrayIcon {
  private readonly _iconPath = process.env.PROD
    ? resolve(__dirname, 'favicon.ico')
    : resolve(__dirname, '../../src-electron/assets/icons/icon.ico');
  private _menuEntryMap = new Map<MenuEntry, () => void>();
  private _tray: Tray | undefined;

  activate() {
    if (!this._tray) {
      this.create();
    }
  }

  registerMenuEntry(entry: MenuEntry, callback: () => void) {
    this._menuEntryMap.set(entry, callback);
  }

  onClick(callback: () => void) {
    this._tray?.on('click', callback);
  }

  private create() {
    this._tray = new Tray(nativeImage.createFromPath(this._iconPath));
    const contextMenu = Menu.buildFromTemplate([
      this._createNormalItem(MenuEntry.Feedback, 'Feedback'),
      this._createNormalItem(MenuEntry.About, 'About'),
      { type: 'separator' },
      this._createNormalItem(MenuEntry.Quit, 'Quit'),
    ]);
    this._tray.displayBalloon({
      icon: nativeImage.createFromPath(this._iconPath),
      title: `Comware Coder v${packageJson.version}`,
      content: 'Click tray icon to open main window',
    });
    this._tray.setContextMenu(contextMenu);
    this._tray.setToolTip(`Comware Coder v${packageJson.version}`);
  }

  private _createNormalItem(
    menuEntry: MenuEntry,
    label: string
  ): MenuItemConstructorOptions {
    return {
      label,
      type: 'normal',
      click: () => this._menuEntryMap.get(menuEntry)?.(),
    };
  }
}
