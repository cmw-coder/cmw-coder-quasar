import type { FileChanges } from 'shared/types/svn';

export interface SvnServiceBase {
  getAllProjectList(): Promise<
    {
      path: string;
      changedFileList: FileChanges[];
    }[]
  >;
  commit(projectPath: string, message: string): Promise<string>;
}
