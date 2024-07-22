import { WindowType } from 'shared/types/WindowType';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { ServiceType } from 'shared/types/service';
import { ExtraData, Selection, TriggerPosition } from 'shared/types/Selection';

const WINDOW_HEIGHT = 34;
// const WINDOW_WIDTH = 380;
const WINDOW_WIDTH = 240;

export class SelectionTipsWindow extends BaseWindow {
  selection?: Selection;
  extraData?: ExtraData;

  constructor() {
    const { compatibility } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();
    super(WindowType.SelectionTips, {
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
      transparent: !compatibility.transparentFallback,
      storePosition: true,
    });
  }

  trigger(
    position: TriggerPosition,
    selection: Selection,
    extraData: ExtraData,
  ) {
    this.selection = selection;
    this.extraData = extraData;
    this.show({
      x: position.x,
      y: position.y,
      height: WINDOW_HEIGHT,
      width: WINDOW_WIDTH,
    });
  }
}
