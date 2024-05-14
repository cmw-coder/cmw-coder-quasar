import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class ChatWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Chat);
  }
}
