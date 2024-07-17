import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';

export class WorkFlowPage extends BasePage {
  constructor() {
    super(MainWindowPageType.WorkFlow);
  }
}
