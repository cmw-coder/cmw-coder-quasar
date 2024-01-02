import { app, Menu, nativeImage, Tray } from 'electron';
import { resolve } from 'path';

import packageJson from 'root/package.json';

export class TrayIcon {
  private _tray: Tray | undefined;

  activate() {
    if (!this._tray) {
      this.create();
    }
  }

  onClick(callback: () => void) {
    this._tray?.on('click', callback);
  }

  private create() {
    console.log(resolve(__dirname, 'favicon.ico'));
    this._tray = new Tray(
      nativeImage.createFromPath(resolve(__dirname, 'favicon.ico'))
    );
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { type: 'separator' },
      {
        label: 'Exit',
        type: 'normal',
        click: () => app.exit(),
      },
    ]);
    this._tray.displayBalloon({
      icon: nativeImage.createFromPath(resolve(__dirname, 'icons/icon.ico')),
      title: 'Comware Coder',
      content: 'Comware Coder is running in the background.',
    });
    this._tray.setContextMenu(contextMenu);
    this._tray.setToolTip(`Comware Coder v${packageJson.version}`);
  }
}
