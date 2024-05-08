import { WindowType } from 'shared/types/WindowType';

export interface WindowServiceBase {
  finishStartSetting(): Promise<void>;
  finishLogin(): Promise<void>;
  toggleMaximizeWindow(type?: WindowType): Promise<void>;
  defaultWindowSize(type: WindowType): Promise<void>;
  minimizeWindow(type?: WindowType): Promise<void>;
  closeWindow(type?: WindowType): Promise<void>;
  getProjectIdWindowActiveProject(): Promise<string | undefined>;
}
