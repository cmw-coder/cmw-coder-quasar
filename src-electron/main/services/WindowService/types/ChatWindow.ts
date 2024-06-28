import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class ChatWindow extends FloatingBaseWindow {
  isReady: boolean = false;
  constructor() {
    super(WindowType.Chat, {
      edgeHide: true,
      storePosition: true,
    });
  }

  afterCreated(): void {
    if (!this._window) {
      return;
    }
    this._window.on('closed', () => {
      this.isReady = false;
    });
    super.afterCreated();
  }

  async checkReady(): Promise<boolean> {
    return false;
  }
}
