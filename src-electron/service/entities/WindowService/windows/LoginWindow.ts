import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class LoginWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Login);
  }
}
