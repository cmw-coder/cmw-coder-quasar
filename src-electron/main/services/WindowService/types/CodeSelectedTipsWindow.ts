import { WindowType } from 'shared/types/WindowType';
import { BaseWindow } from 'main/services/WindowService/types/BaseWindow';

export class CodeSelectedTipsWindow extends BaseWindow {
  constructor() {
    super(WindowType.CodeSelectedTips);
  }
}
