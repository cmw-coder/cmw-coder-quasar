import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';
import { TransplantProjectInstance } from 'main/components/TransplantProjectInstance';
import { TransplantProjectOptions } from 'shared/types/transplantProject';

export class TransplantProjectPage extends BasePage {
  private activeTransplantProject?: TransplantProjectInstance;
  constructor() {
    super(MainWindowPageType.TransplantProject);
  }

  createTransplantProject(options: TransplantProjectOptions) {
    this.activeTransplantProject = new TransplantProjectInstance(options);
  }

  getActiveTransplantProjectData() {
    return this.activeTransplantProject?.getData();
  }
}
