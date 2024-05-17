import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class SettingWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Setting);
  }
}
