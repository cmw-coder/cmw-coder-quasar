import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class LoginWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Login);
  }
}
