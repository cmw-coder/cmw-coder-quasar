import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class SettingWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Setting);
  }
}
