import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';
import {
  AddSelectionToChatActionMessage,
  CheckChatIsReadyActionMessage,
} from 'shared/types/ActionMessage';
import { Selection } from 'shared/types/Selection';
import { WindowType } from 'shared/types/WindowType';

export class ChatWindow extends FloatingBaseWindow {
  isReady: boolean = false;
  readyPromiseResolveFn?: () => void;
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

  async checkReady() {
    this.sendMessageToRenderer(new CheckChatIsReadyActionMessage());
    return new Promise<void>((resolve) => {
      this.readyPromiseResolveFn = resolve;
    });
  }

  addSelectionToChat(selection: Selection) {
    this._window?.focus();
    this.sendMessageToRenderer(new AddSelectionToChatActionMessage(selection));
  }
}
