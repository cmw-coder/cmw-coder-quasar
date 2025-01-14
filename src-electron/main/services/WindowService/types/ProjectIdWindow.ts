import { FloatingBaseWindow } from 'main/services/WindowService/types/FloatingBaseWindow';

import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class ProjectIdWindow extends FloatingBaseWindow {
  project?: string;
  constructor() {
    super(WindowType.ProjectId);
  }

  setProject(project: string) {
    this.project = project;
  }
}
