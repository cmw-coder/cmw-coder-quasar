import { SelectionData } from 'cmw-coder-subprocess';

import { container } from 'main/services';
import { WindowService } from 'main/services/WindowService';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';

import { AddSelectionToChatActionMessage } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class ChatPage extends BasePage {
  constructor() {
    super(MainWindowPageType.Chat);
  }

  async addSelectionToChat(selectionData: SelectionData) {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = windowService.getWindow(WindowType.Main);
    mainWindow.show();
    await this.active();
    mainWindow.sendMessageToRenderer(
      new AddSelectionToChatActionMessage(selectionData),
    );
  }
}
