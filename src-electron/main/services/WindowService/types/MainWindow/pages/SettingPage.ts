import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';

export class SettingPage extends BasePage {
  constructor() {
    super(MainWindowPageType.Setting);
  }
}
