import { BrowserWindow } from 'electron';
import { BaseWindow } from 'service/entities/WindowService/windows/BaseWindow';
import { WindowType } from 'shared/types/WindowType';
import { resolve } from 'path';
import { container } from 'service/index';
import type { DataStoreService } from 'service/entities/DataStoreService';
import { ServiceType } from 'shared/services';

export class CompletionsWindow extends BaseWindow {
  constructor() {
    super(WindowType.Completions);
  }

  protected create(): BrowserWindow {
    const { compatibility } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();

    return new BrowserWindow({
      width: compatibility.transparentFallback ? 0 : 3840,
      height: compatibility.transparentFallback ? 0 : 2160,
      minWidth: 0,
      minHeight: 0,
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
      transparent: compatibility.transparentFallback,
      webPreferences: {
        // devTools: false,
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });
  }
}
