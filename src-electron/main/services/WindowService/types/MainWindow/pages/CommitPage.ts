import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { BasePage } from 'main/services/WindowService/types/MainWindow/pages/BasePage';

export class CommitPage extends BasePage {
  currentFile?: string;
  constructor() {
    super(MainWindowPageType.Commit);
  }

  setCurrentFile(currentFile: string): void {
    this.currentFile = currentFile;
  }
}
