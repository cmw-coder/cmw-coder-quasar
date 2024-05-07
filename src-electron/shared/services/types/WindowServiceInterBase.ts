import { WindowType } from 'shared/types/WindowType';

export interface WindowServiceBase {
  finishStartSetting(): Promise<void>;
  finishLogin(): Promise<void>;
  closeWindow(type?: WindowType): Promise<void>;
  getProjectIdWindowActiveProject(): Promise<string | undefined>;
}
