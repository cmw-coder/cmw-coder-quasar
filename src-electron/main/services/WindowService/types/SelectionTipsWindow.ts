import { SelectionData, ExtraData } from 'cmw-coder-subprocess';

import { container } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { DataStoreService } from 'main/services/DataStoreService';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';

const WINDOW_HEIGHT = 34;
const WINDOW_WIDTH = 540;

export class SelectionTipsWindow extends BaseWindow {
  selectionData?: SelectionData;
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
    position: {
      x: number;
      y: number;
    },
    selectionData: SelectionData,
    extraData: ExtraData,
  ) {
    this.selectionData = selectionData;
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
