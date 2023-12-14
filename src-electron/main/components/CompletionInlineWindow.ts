import { BrowserWindow } from 'electron';
import { resolve } from 'path';
import { registerAction } from 'main/server';
import { Action } from 'types/action';

export class CompletionInlineWindow {
  private _window: BrowserWindow | undefined;

  activate() {
    if (this._window) {
      this._window.show();
    } else {
      this.create();
    }
  }

  private create() {
    this._window = new BrowserWindow({
      width: 500,
      height: 21,
      useContentSize: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: false,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        contextIsolation: true,
        devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });

    this._window.setIgnoreMouseEvents(true);

    this._window
      .loadURL(process.env.APP_URL + '#/simple/completion/inline')
      .then();

    this._window.on('ready-to-show', () =>
      registerAction(Action.CompletionGenerate, (message) =>
        this._window?.webContents.send('action', message)
      )
    );
  }

  showCompletionWindow() {
    this._window?.show();
  }

  hideCompletionWindow() {
    this._window?.hide();
  }

  setCompletionWindowBounds(x: number, y: number) {
    this._window?.setPosition(x, y);
  }

  setCompletionWindowWebContents(webContents) {
    this.completionWindow.webContents = webContents;
  }

  getCompletionWindow() {
    return this.completionWindow;
  }
}
