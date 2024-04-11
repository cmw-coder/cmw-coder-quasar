import { ChangedFile } from 'shared/types/svn';

export interface I_InvokeService {
  sayHello(data: string): Promise<number>;
  getAllProjectList(): Promise<
    {
      path: string;
      changedFileList: ChangedFile[];
    }[]
  >;
}

export const InvokeServiceKey = 'InvokeService:Call';
