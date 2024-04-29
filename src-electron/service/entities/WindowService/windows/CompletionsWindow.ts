import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class CompletionsWindow extends FloatingBaseWindow {
  constructor() {
    super(WindowType.Completions);
  }
}
