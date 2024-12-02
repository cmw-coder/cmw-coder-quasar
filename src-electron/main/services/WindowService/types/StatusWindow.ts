import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

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
      fullscreenable: false,
      height: 32,
      width: 200,
      x: 200,
      y: 0,
      show: false,
      transparent: true,
      skipTaskbar: true,
    });
  }
}
