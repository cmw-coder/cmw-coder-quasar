import { BrowserWindow } from 'electron';
import { resolve } from 'path';
import { registerWsMessage } from 'main/server';
import { WsAction } from 'shared/types/WsMessage';
import { ControlType, registerControlCallback } from 'preload/types/ControlApi';
import { WindowType } from 'shared/types/WindowType';

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
      registerWsMessage(WsAction.CompletionGenerate, (message) =>
        this._window?.webContents.send('action', message)
      )
    );

    registerControlCallback(WindowType.CompletionInline, ControlType.Hide, () =>
      this._window?.hide()
    );
    registerControlCallback(WindowType.CompletionInline, ControlType.Show, () =>
      this._window?.show()
    );
    registerControlCallback(
      WindowType.CompletionInline,
      ControlType.Move,
      (data) => {
        if (this._window) {
          const [currentX, currentY] = this._window.getPosition();
          this._window?.setPosition(data.x ?? currentX, data.y ?? currentY);
        }
      }
    );
  }
}
