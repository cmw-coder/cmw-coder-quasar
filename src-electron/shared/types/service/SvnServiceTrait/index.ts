import { FileChanges } from 'shared/types/service/SvnServiceTrait/types';

export interface SvnServiceTrait {
  getAllProjectList(): Promise<
    {
      path: string;
      changedFileList: FileChanges[];
    }[]
  >;
  commit(projectPath: string, message: string): Promise<string>;
}
