import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class ChatWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Chat);
  }
}
