import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class CommitWindow extends FloatingBaseWindow {
  currentFile?: string;
  constructor() {
    super(WindowType.Commit);
  }

  setCurrentFile(currentFile: string): void {
    this.currentFile = currentFile;
  }
}
