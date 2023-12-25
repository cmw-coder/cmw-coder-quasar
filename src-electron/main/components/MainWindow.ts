import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import { registerWsMessage } from 'main/server';
import { WsAction } from 'shared/types/WsMessage';
import { WindowType } from 'shared/types/WindowType';
import {
  DebugSyncActionMessage,
  sendToRenderer,
} from 'preload/types/ActionApi';

export class MainWindow {
  private _window: BrowserWindow | undefined;
  private readonly _urlBase = `${process.env.APP_URL}/#/main`;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  login(userId: string) {
    const isVisible = this._window?.isVisible() ?? false;
    console.log(isVisible);
    this.activate();
    const url = new URL('/login', this._urlBase);
    url.search = new URLSearchParams({
      isVisible: isVisible.toString(),
      userId,
    }).toString();
    this._window?.loadURL(url.href).then();
  }

  private create() {
    this._window = new BrowserWindow({
      width: 630,
      height: 1120,
      useContentSize: true,
      frame: false,
      icon: resolve(__dirname, 'icons/icon.png'), // taskbar icon
      webPreferences: {
        contextIsolation: true,
        // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    this._window.loadURL(this._urlBase).then();

    this._window.webContents.openDevTools({ mode: 'undocked' });

    // this._window.webContents.on('devtools-opened', () => {
    //   this._window?.webContents.closeDevTools();
    // });

    this._window.on('closed', () => {
      this._window = undefined;
    });

    this._window.on('ready-to-show', () =>
      registerWsMessage(WsAction.DebugSync, (message) => {
        if (this._window) {
          sendToRenderer(
            this._window,
            new DebugSyncActionMessage(message.data)
          );
        }
      })
    );

    registerControlCallback(WindowType.Main, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(WindowType.Main, ControlType.Minimize, () =>
      this._window?.minimize()
    );
    registerControlCallback(WindowType.Main, ControlType.ToggleMaximize, () => {
      if (this._window?.isMaximized()) {
        this._window?.unmaximize();
      } else {
        this._window?.maximize();
      }
    });
  }
}
