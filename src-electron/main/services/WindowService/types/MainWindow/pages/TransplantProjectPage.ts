import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { TransplantProjectInstance } from 'main/components/TransplantProjectInstance';

export class TransplantProjectPage extends BasePage {
  private activeTransplantProjectInstance?: TransplantProjectInstance;
  constructor() {
    super(MainWindowPageType.TransplantProject);
  }
}
