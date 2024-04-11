import { inject, injectable } from 'inversify';
import { ipcMain } from 'electron';
import { TYPES } from 'service/types';
import { ConfigService } from 'service/entities/ConfigService';
import { SvnService } from 'service/entities/SvnService';
// import { dataStore } from 'main/stores';
import {
  I_InvokeService,
  InvokeServiceKey,
} from 'shared/types/I_InvokeService';
import { ChangedFile } from 'shared/types/svn';

@injectable()
export class InvokeService implements I_InvokeService {
  @inject(TYPES.ConfigService)
  private _configService!: ConfigService;
  @inject(TYPES.SvnService)
  private _svnService!: SvnService;
  constructor() {
    ipcMain.handle(
      InvokeServiceKey,
      (event, functionName: keyof InvokeService, ...payloads: unknown[]) => {
        const func = this[functionName];
        if (typeof func !== 'function') {
          throw new Error('Function not found');
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return func.bind(this)(...payloads);
      },
    );
  }

  init() {
    console.log('InvokeService initialized');
  }

  async sayHello(data: string) {
    console.log('Hello from InvokeService', data);
    this._configService.sayHello();
    return Math.random();
  }

  async getAllProjectList() {
    const result = [] as {
      path: string;
      changedFileList: ChangedFile[];
    }[];
    const projectPathList = ['D:\\svn-test'];
    // const projectPathList = Object.keys(dataStore.store.project);
    for (let i = 0; i < projectPathList.length; i++) {
      const projectPath = projectPathList[i];
      const changedFileList = await this._svnService.dirDiff(projectPath);
      result.push({
        path: projectPath,
        changedFileList,
      });
    }
    return result;
  }
}
