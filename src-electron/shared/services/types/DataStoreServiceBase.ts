import { AppData } from 'shared/types/AppData';
import { QuestionTemplateModelContent } from 'shared/types/QuestionTemplate';

export interface DataStoreServiceBase {
  getAppDataAsync(): Promise<AppData>;
  setAppDataAsync<T extends keyof AppData>(
    key: T,
    value: AppData[T],
  ): Promise<void>;
  setProjectId(path: string, projectId: string): Promise<void>;
  setProjectLastAddedLines(path: string, lastAddedLines: number): Promise<void>;
  setProjectSvn(projectPath: string, svnPath: string): Promise<void>;
  getActiveModelContent(): Promise<QuestionTemplateModelContent>;
}
