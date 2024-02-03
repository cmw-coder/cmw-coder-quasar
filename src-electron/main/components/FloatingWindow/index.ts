import { BrowserWindow } from 'electron';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { resolve } from 'path';

import { configStore } from 'main/stores';
import { bypassCors } from 'main/utils/common';
import { sendToRenderer } from 'preload/types/ActionApi';
import {
  ControlType,
  registerControlCallback,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import packageJson from 'root/package.json';
import {
  UpdateFinishActionMessage,
  UpdateProgressActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';

export class FloatingWindow {
  private readonly _type = WindowType.Floating;
  private _window: BrowserWindow | undefined;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  projectId(path: string, pid: number) {
    if (
      this._window &&
      !this._window.isMinimized() &&
      this._window.isVisible()
    ) {
      return;
    }
    this.activate();
    if (this._window) {
      this._window?.center();
      this._window?.focus();
      const searchString = new URLSearchParams({
        path,
        pid: pid.toString(),
      }).toString();
      this._window
        ?.loadURL(`${process.env.APP_URL}#/floating/projectId?${searchString}`)
        .catch();
    }
  }

  login(mainIsVisible: boolean) {
    if (mainIsVisible) {
      triggerControlCallback(WindowType.Main, ControlType.Hide, undefined);
    }
    this._window?.close();
    this.activate();
    if (this._window) {
      this._window.center();
      this._window.focus();
      const searchString = new URLSearchParams({
        userId: configStore.config.userId,
        showMain: mainIsVisible ? 'true' : 'false',
      }).toString();
      this._window
        .loadURL(`${process.env.APP_URL}#/floating/login?${searchString}`)
        .catch();
    }
  }

  updateFinish() {
    if (this._window) {
      sendToRenderer(this._window, new UpdateFinishActionMessage());
    }
  }

  updateProgress(progressInfo: ProgressInfo) {
    if (this._window) {
      sendToRenderer(
        this._window,
        new UpdateProgressActionMessage(progressInfo)
      );
    }
  }

  updateShow(updateInfo: UpdateInfo) {
    this._window?.close();
    this.activate();
    if (this._window) {
      const { version, releaseDate } = updateInfo;
      this._window.center();
      this._window.focus();
      const searchString = new URLSearchParams({
        currentVersion: packageJson.version,
        newVersion: version,
        releaseDate,
      }).toString();
      this._window
        .loadURL(`${process.env.APP_URL}#/floating/update?${searchString}`)
        .catch();
    }
  }

  private create() {
    this._window = new BrowserWindow({
      width: 800,
      height: 600,
      useContentSize: true,
      resizable: false,
      movable: true,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: true,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: false,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    bypassCors(this._window);

    this._window.setAlwaysOnTop(true, 'pop-up-menu');

    this._window.on('ready-to-show', async () => {
      if (this._window) {
        // this._window.webContents.openDevTools({ mode: 'undocked' });
      }
    });

    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(this._type, ControlType.Reload, () =>
      this._window?.reload()
    );
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show()
    );
  }
}
