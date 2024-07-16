import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { container } from 'main/services';
import { WindowType } from 'shared/types/WindowType';
import { WindowService } from 'main/services/WindowService';
import { AddSelectionToChatActionMessage } from 'shared/types/ActionMessage';
import { Selection } from 'shared/types/Selection';
import { ServiceType } from 'shared/types/service';

export class ChatPage extends BasePage {
  constructor() {
    super(MainWindowPageType.Chat);
  }

  async addSelectionToChat(selection: Selection) {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    mainWindow.show();
    await this.active();
    mainWindow.sendMessageToRenderer(
      new AddSelectionToChatActionMessage(selection),
    );
  }
}
