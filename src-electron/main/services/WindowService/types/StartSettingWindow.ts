import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class StartSettingWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.StartSetting);
  }
}
