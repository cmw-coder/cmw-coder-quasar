import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class LoginWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Login);
  }
}
