import log from 'electron-log/main';
import { injectable } from 'inversify';

import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { fileDiff, repoStatus, svnPath } from 'main/services/SvnService/utils';
import { WebsocketService } from 'main/services/WebsocketService';
import { executeCommand } from 'main/utils/common';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { ServiceType } from 'shared/types/service';
import type { SvnServiceTrait } from 'shared/types/service/SvnServiceTrait';

@injectable()
export class SvnService implements SvnServiceTrait {
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
      diff.split(NEW_LINE_REGEX).forEach((line) => {
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
      `${svnPath} commit -m ${commitMessage}`,
      path,
    );
    log.debug('commit', { path, commitMessage, stdout, stderr });
    if (stderr && stderr.length) {
      throw new Error(stderr);
    }
    return stdout;
  }
}
