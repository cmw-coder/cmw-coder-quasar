import { resolve } from 'path';
import { BrowserWindow } from 'electron';
import { BaseWindow } from 'service/entities/WindowService/windows/BaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class FloatingBaseWindow extends BaseWindow {
  constructor(type: WindowType) {
    super(type);
  }

  protected create(): BrowserWindow {
    return new BrowserWindow({
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
  }
}
