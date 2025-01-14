import { dialog } from 'electron';
import log from 'electron-log/main';
import { injectable } from 'inversify';

import { container } from 'main/services';
import { DataService } from 'main/services/DataService';
import { WindowService } from 'main/services/WindowService';
import { svnPath } from 'main/services/SvnService/constants';
import { fileDiff, repoStatus } from 'main/services/SvnService/utils';
import { WebsocketService } from 'main/services/WebsocketService';
import { executeCommand } from 'main/utils/common';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { ServiceType } from 'shared/types/service';
import type { SvnServiceTrait } from 'shared/types/service/SvnServiceTrait';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';
import path from 'path';
import fs from 'fs';
import { getRevision } from 'main/utils/svn';

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
      .get<DataService>(ServiceType.DATA)
      .getStoreSync();
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

  async selectSvnDirectory() {
    const WindowService = container.get<WindowService>(ServiceType.WINDOW);
    const mainWindow = WindowService.getWindow(WindowType.Main);
    if (!mainWindow._window) {
      return;
    }
    const targetDirPathList = dialog.showOpenDialogSync(mainWindow._window, {
      properties: ['openDirectory'],
    });
    if (!targetDirPathList) {
      return;
    }
    const svnDirPath = targetDirPathList[0];
    const svnExistDir = path.join(svnDirPath, '.svn');
    if (!fs.existsSync(svnExistDir)) {
      dialog
        .showMessageBox(mainWindow._window, {
          message: '该目录下不存在 .svn 目录，请选择 svn 项目目录',
          type: 'error',
        })
        .catch();
      return;
    }
    const revision = await getRevision(svnDirPath);
    return {
      directory: svnDirPath,
      revision,
    };
  }
}
