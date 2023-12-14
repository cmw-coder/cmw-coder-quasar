import { app, Menu, nativeImage, Tray } from 'electron';
import { resolve } from 'path';

export class TrayIcon {
  private _tray: Tray | undefined;

  activate() {
    if (!this._tray) {
      this.create();
    }
  }

  private create() {
    console.log(resolve(__dirname, 'icons/icon.ico'));
    this._tray = new Tray(
      nativeImage.createFromPath(resolve(__dirname, 'icons/icon.ico'))
    );
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      {
        label: 'Exit',
        type: 'normal',
        click: () => {
          app.quit();
        },
      },
    ]);
    this._tray.setToolTip('This is my application.');
    this._tray.setContextMenu(contextMenu);
  }
}
