import { injectable } from 'inversify';

import { executeCommand } from 'main/utils/common';
import { DataStoreService } from 'service/entities/DataStoreService';
import { fileDiff, repoStatus } from 'service/entities/SvnService/utils';
import { container } from 'service/index';
import { ServiceType } from 'shared/services';
import type { SvnServiceBase } from 'shared/services/types/SvnServiceBase';
import log from 'electron-log/main';
import type { WebsocketService } from 'service/entities/WebsocketService';

@injectable()
export class SvnService implements SvnServiceBase {
  async repoDiff(path: string) {
    return (
      await Promise.all(
        (await repoStatus(path)).map(async (status) => {
          try {
            return {
              ...status,
              diff: await fileDiff(status.path, path),
            };
          } catch (e) {
            log.error('repoDiff', { path, status, e });
            return {
              ...status,
              diff: '',
            };
          }
        }),
      )
    ).map(({ diff, path, status }) => {
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
        status,
        additions,
        deletions,
        diff,
      };
    });
  }

  async getAllProjectList() {
    const currentProjectPath = container
      .get<WebsocketService>(ServiceType.WEBSOCKET)
      .getClientInfo()?.currentProject;
    const { project } = container
      .get<DataStoreService>(ServiceType.DATA_STORE)
      .getAppdata();
    if (currentProjectPath && project[currentProjectPath]) {
      return await Promise.all(
        project[currentProjectPath].svn.map(async (svn) => ({
          path: svn.directory,
          changedFileList: await this.repoDiff(svn.directory),
        })),
      );
    }
    return [];
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
