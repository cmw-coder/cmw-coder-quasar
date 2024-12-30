import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

import { defaultAppData } from 'shared/types/service/DataServiceTrait/types';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

const defaultData = defaultAppData.window[WindowType.Status];

export class StatusWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Status, {
      useEdgeHide: false,
      storePosition: true,
      minimizable: false,
      alwaysOnTop: true,
      maximizable: false,
      resizable: false,
      closable: false,
      focusable: false,
      fullscreenable: false,
      height: defaultData.height,
      width: defaultData.width,
      x: defaultData.x,
      y: defaultData.y,
      show: defaultData.show,
      transparent: true,
      skipTaskbar: true,
    });
  }

  move(
    dimensions: { height: number; width: number; x: number; y: number },
    animate = false,
  ) {
    if (this._window) {
      const [width, height] = this._window.getContentSize();
      this._window?.setBounds(
        {
          x: Math.round(dimensions.x + dimensions.width / 2),
          y: Math.round(dimensions.y + 1),
          height,
          width,
        },
        animate,
      );
    }
  }
}
