import { WindowType } from 'shared/types/WindowType';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { ServiceType } from 'shared/types/service';
import { Selection, TriggerPosition } from 'shared/types/Selection';
import { Range } from 'main/types/vscode/range';

export class SelectionTipsWindow extends BaseWindow {
  selection?: Selection;

  constructor() {
    const { compatibility } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();
    super(WindowType.SelectionTips, {
      useContentSize: true,
      resizable: true,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: true,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      show: false,
      frame: false,
      transparent: !compatibility.transparentFallback,
    });

    this.selection = {
      file: 'D:\\project\\cmw-coder\\cmw-coder-quasar\\src-electron\\main\\services\\WindowService\\types\\SelectionTipsWindow.ts',
      content: "import { WindowType } from 'shared/types/WindowType';",
      range: new Range(1, 53, 2, 1),
    };
  }

  trigger(position: TriggerPosition, selection: Selection) {
    if (!this._window) {
      return;
    }
    this.selection = selection;
    this._window.setPosition(position.x, position.y);
    this.show();
  }
}
