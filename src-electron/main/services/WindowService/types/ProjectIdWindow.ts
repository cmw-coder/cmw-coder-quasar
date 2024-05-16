import { WindowType } from 'shared/types/WindowType';
import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

export class ProjectIdWindow extends FloatingBaseWindow {
  project?: string;
  constructor() {
    super(WindowType.ProjectId);
  }

  setProject(project: string) {
    this.project = project;
  }
}
