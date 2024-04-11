import { BrowserWindow } from 'electron';
import log from 'electron-log/main';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { resolve } from 'path';

import { websocketManager } from 'main/components/WebsocketManager';
import { configStore, dataStore } from 'main/stores';
import { BaseWindow } from 'main/types/BaseWindow';
import { bypassCors } from 'main/utils/common';
import { getChangedFileList, svnCommit } from 'main/utils/svn';
import { ActionApi, sendToRenderer } from 'preload/types/ActionApi';
import {
  ControlType,
  registerControlCallback,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import packageJson from 'root/package.json';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
  RouterReloadActionMessage,
  SvnCommitActionMessage,
  SvnDiffActionMessage,
  UpdateFinishActionMessage,
  UpdateProgressActionMessage,
} from 'shared/types/ActionMessage';
import { ChangedFile } from 'shared/types/svn';
import { WindowType } from 'shared/types/WindowType';

export class FloatingWindow extends BaseWindow {
  private readonly _actionApi = new ActionApi('main.FloatingWindow.');
  private _currentRoute = '';

  constructor() {
    super(WindowType.Floating);
  }

  commit(currentFile: string) {
    this.activate();
    if (this._window) {
      this._window.setSize(600, 1000);
      this._window.center();
      this._window.focus();
      this._loadUrl('/floating/commit', { currentFile });
    } else {
      log.warn('Floating window activate failed');
    }
  }

  feedback() {
    this.activate();
    if (this._window) {
      this._window.setSize(600, 850);
      this._window.center();
      this._window.focus();
      this._loadUrl('/floating/feedback');
    } else {
      log.warn('Floating window activate failed');
    }
  }

  login(mainIsVisible: boolean) {
    if (mainIsVisible) {
      triggerControlCallback(WindowType.Main, ControlType.Hide, undefined);
    }
    this.activate();
    if (this._window) {
      this._window.center();
      this._window.focus();
      this._loadUrl('/floating/login', {
        userId: configStore.config.userId,
        showMain: mainIsVisible,
      });
    } else {
      log.warn('Floating window activate failed');
    }
  }

  projectId(project: string) {
    this.activate();
    if (this._window) {
      this._window.center();
      this._window.focus();
      this._loadUrl('/floating/projectId', { project });
    } else {
      log.warn('Floating window activate failed');
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
        new UpdateProgressActionMessage(progressInfo),
      );
    }
  }

  updateShow(updateInfo: UpdateInfo) {
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

  protected create() {
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

    this._window.once('ready-to-show', () => {
      if (this._window) {
        this._window.webContents.openDevTools({ mode: 'undocked' });
        this._window.show();
      }
    });

    this._actionApi.register(ActionType.ConfigStoreLoad, () => {
      if (this._window) {
        sendToRenderer(
          this._window,
          new ConfigStoreLoadActionMessage(configStore.store),
        );
      }
    });
    this._actionApi.register(ActionType.SvnDiff, async () => {
      if (this._window) {
        let changedFileList: ChangedFile[] | undefined;
        const projectPath = websocketManager.getClientInfo()?.currentProject;
        if (projectPath && dataStore.store.project[projectPath]?.svn[0]) {
          changedFileList = await getChangedFileList(
            dataStore.store.project[projectPath].svn[0].directory,
          );
        }
        sendToRenderer(this._window, new SvnDiffActionMessage(changedFileList));
      }
    });
    this._actionApi.register(ActionType.SvnCommit, async (data) => {
      if (this._window) {
        const projectPath = websocketManager.getClientInfo()?.currentProject;
        if (projectPath && dataStore.store.project[projectPath]?.svn[0]) {
          try {
            await svnCommit(
              dataStore.store.project[projectPath].svn[0].directory,
              data,
            );
            sendToRenderer(this._window, new SvnCommitActionMessage('success'));
          } catch (e) {
            sendToRenderer(this._window, new SvnCommitActionMessage(<string>e));
          }
        } else {
          sendToRenderer(
            this._window,
            new SvnCommitActionMessage('invalidProject'),
          );
        }
      }
    });

    registerControlCallback(this._type, ControlType.Close, () => {
      if (this._window) {
        this._window?.destroy();
        this._window = undefined;
        this._currentRoute = '';
      }
    });
    registerControlCallback(this._type, ControlType.Hide, () =>
      this._window?.hide(),
    );
    registerControlCallback(this._type, ControlType.Reload, () => {
      if (this._window) {
        sendToRenderer(this._window, new RouterReloadActionMessage());
      }
    });
    registerControlCallback(this._type, ControlType.Show, () =>
      this._window?.show(),
    );
  }

  private _loadUrl<
    T extends {
      toString: (radix?: number) => string;
    },
  >(route: string, searchParams?: Record<string, string | T>) {
    if (!this._window) {
      return;
    }
    if (this._currentRoute === route) {
      sendToRenderer(this._window, new RouterReloadActionMessage());
    } else {
      let url = `${process.env.APP_URL}#${route}`;
      if (searchParams) {
        for (const key in searchParams) {
          if (typeof searchParams[key] !== 'string') {
            searchParams[key] = searchParams[key].toString();
          }
        }
        url += `?${new URLSearchParams(
          <Record<string, string>>searchParams,
        ).toString()}`;
      }
      this._window
        .loadURL(url)
        .then(() => (this._currentRoute = route))
        .catch((e) => log.debug(e));
    }
  }
}
