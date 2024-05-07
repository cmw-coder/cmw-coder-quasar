import { FloatingBaseWindow } from 'service/entities/WindowService/windows/FloatingBaseWindow';
import { WindowType } from 'shared/types/WindowType';

export class ProjectIdWindow extends FloatingBaseWindow {
  project?: string;
  constructor() {
    super(WindowType.ProjectId);
  }

  setProject(project: string) {
    this.project = project;
  }
}
