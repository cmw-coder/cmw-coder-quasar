import { resolve } from 'path';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class MainWindow extends BaseWindow {
  constructor() {
    super(WindowType.Main, {
      edgeHide: true,
      width: 600,
      height: 800,
      useContentSize: true,
      show: false,
      frame: false,
      webPreferences: {
        preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      },
    });
  }
}
