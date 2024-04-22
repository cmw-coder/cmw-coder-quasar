import { injectable } from 'inversify';

import { executeCommand } from 'main/utils/common';
import { DataStoreService } from 'service/entities/DataStoreService';
import { fileDiff, repoStatus } from 'service/entities/SvnService/utils';
import { container } from 'service/index';
import { ServiceType } from 'shared/services';
import type { SvnServiceBase } from 'shared/services/types/SvnServiceBase';
import { ChangedFile } from 'shared/types/svn';
import log from 'electron-log/main';

@injectable()
export class SvnService implements SvnServiceBase {
  async repoDiff(path: string) {
    return (
      await Promise.all(
        (await repoStatus(path)).map(async (status) => ({
          ...status,
          diff: await fileDiff(status.path, path),
        })),
      )
    ).map(({ diff, path, type }) => {
      let additions = 0;
      let deletions = 0;
      diff.split(/\r?\n/).forEach((line) => {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          additions++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          deletions++;
        }
      });
      return {
        path,
        type,
        additions,
        deletions,
        diff,
      };
    });
  }

  async getAllProjectList() {
    const result: {
      path: string;
      changedFileList: ChangedFile[];
    }[] = [];
    const dataStore = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    ).dataStore;
    const projectPathList = Object.keys(dataStore.store.project);
    for (let i = 0; i < projectPathList.length; i++) {
      const projectPath = projectPathList[i];
      const changedFileList = await this.repoDiff(projectPath);
      result.push({
        path: projectPath,
        changedFileList,
      });
    }
    return result;
  }

  async commit(path: string, commitMessage: string) {
    const { stdout, stderr } = await executeCommand(
      `svn commit -m ${commitMessage}`,
      path,
    );
    log.debug('commit', { path, commitMessage, stdout, stderr });
    if (stderr && stderr.length) {
      throw new Error(stderr);
    }
    return stdout;
  }
}
