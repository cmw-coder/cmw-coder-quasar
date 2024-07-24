import { WindowType } from 'shared/types/WindowType';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { ServiceType } from 'shared/types/service';
import { ExtraData, Selection, TriggerPosition } from 'shared/types/Selection';
import { ConfigService } from 'main/services/ConfigService';

const WINDOW_HEIGHT = 34;
const WINDOW_WIDTH = 460;

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

  async trigger(
    position: TriggerPosition,
    selection: Selection,
    extraData: ExtraData,
  ) {
    this.selection = selection;
    this.extraData = extraData;
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    let showSelectedTipsWindow = await configService.getConfig(
      'showSelectedTipsWindow',
    );
    if (showSelectedTipsWindow === undefined) {
      await configService.setConfig('showSelectedTipsWindow', true);
      showSelectedTipsWindow = true;
    }
    if (showSelectedTipsWindow) {
      this.show({
        x: position.x,
        y: position.y,
        height: WINDOW_HEIGHT,
        width: WINDOW_WIDTH,
      });
    }
  }
}
