import { ChangedFile } from 'shared/types/svn';

export interface I_SvnService {
  getAllProjectList(): Promise<
    {
      path: string;
      changedFileList: ChangedFile[];
    }[]
  >;
  commit(projectPath: string, message: string): Promise<string>;
}
