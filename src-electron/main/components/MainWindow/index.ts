import { BrowserWindow } from 'electron';
import { resolve } from 'path';

import { registerWsMessage } from 'main/server';
import { historyToHash } from 'main/utils/common';
import {
  DebugSyncActionMessage,
  sendToRenderer,
} from 'preload/types/ActionApi';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import { WsAction } from 'shared/types/WsMessage';
import { WindowType } from 'shared/types/WindowType';

export class MainWindow {
  private _window: BrowserWindow | undefined;
  private readonly _urlBase = process.env.APP_URL;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  login(userId: string) {
    const isMinimized = this._window?.isMinimized() ?? false;
    const isVisible = this._window?.isVisible() ?? false;
    this.activate();
    this._window?.center();
    this._window?.focus();
    const url = new URL('/main/login', this._urlBase);
    url.search = new URLSearchParams({
      isMinimized: isMinimized.toString(),
      isVisible: isVisible.toString(),
      userId,
    }).toString();
    console.log(url.search);
    this._window?.loadURL(historyToHash(url).href).catch();
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

    this._window.loadURL(this._urlBase).catch((e) => {
      if (e.code !== 'ERR_ABORTED') {
        throw e;
      }
    });

    this._window.webContents.openDevTools({ mode: 'undocked' });

    // this._window.webContents.on('devtools-opened', () => {
    //   this._window?.webContents.closeDevTools();
    // });

    this._window.on('closed', () => {
      this._window = undefined;
    });

    this._window.on('ready-to-show', async () => {
      registerWsMessage(WsAction.DebugSync, (message) => {
        if (this._window) {
          sendToRenderer(
            this._window,
            new DebugSyncActionMessage(message.data)
          );
        }
      });
    });

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
