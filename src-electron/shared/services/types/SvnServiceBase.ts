import type { ChangedFile } from 'shared/types/svn';

export interface SvnServiceBase {
  getAllProjectList(): Promise<
    {
      path: string;
      changedFileList: ChangedFile[];
    }[]
  >;
  commit(projectPath: string, message: string): Promise<string>;
}
