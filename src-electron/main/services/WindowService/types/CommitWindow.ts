import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class CommitWindow extends FloatingBaseWindow {
  currentFile?: string;
  constructor() {
    super(WindowType.Commit);
  }

  setCurrentFile(currentFile: string): void {
    this.currentFile = currentFile;
  }
}
