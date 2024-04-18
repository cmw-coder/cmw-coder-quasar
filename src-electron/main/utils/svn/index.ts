import { SVNClient } from '@taiyosen/easy-svn';
import log from 'electron-log/main';
import { readdir, stat } from 'fs/promises';
import { resolve } from 'path';

import {
  executeCommand,
  folderLatestModificationTime,
} from 'main/utils/common';
import packageJson from 'root/package.json';
import { container } from 'service';
import { DataStoreService } from 'service/entities/DataStoreService';
import { StatisticsReporterService } from 'service/entities/StatisticsReporterService';
import { ServiceType } from 'shared/services';

export const searchSvnDirectories = async (
  folder: string,
): Promise<string[]> => {
  const directories: string[] = [];
  try {
    const items = await readdir(folder);
    for (const item of items) {
      const filePath = resolve(folder, item);
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        if (item === '.svn') {
          log.debug('Found svn directory:', folder);
          directories.push(folder);
        } else {
          directories.push(...(await searchSvnDirectories(filePath)));
        }
      }
    }
  } catch {}
  return directories;
};

export const getRevision = async (path: string): Promise<number> => {
  try {
    const client = new SVNClient();
    client.setConfig({ silent: true });
    const info = await client.info(path);
    const revision = info.match(/Last Changed Rev: (\d+)/)?.[1];
    if (revision) {
      log.debug(`Revision for ${path}: ${revision}`);
      return parseInt(revision);
    }
  } catch (e) {
    log.warn('Get revision failed', e);
  }
  return -1;
};

export const getAddedLines = async (path: string, revision: number) => {
  const { stdout, stderr } = await executeCommand(
    `svn diff -r ${revision}`,
    path,
  );
  return `${stdout}\r\n${stderr}`
    .split(/\r?\n/)
    .filter((line) => line.startsWith('+') && !line.startsWith('++'))
    .map((line) => line.substring(1))
    .filter((line) => line.trim().length > 0)
    .join('\r\n')
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
    .split('\r\n').length;
};

export const reportProjectAdditions = async () => {
  const dataStore = container.get<DataStoreService>(
    ServiceType.DATA_STORE,
  ).dataStore;
  const statisticsReporterService = container.get<StatisticsReporterService>(
    ServiceType.STATISTICS_REPORTER,
  );
  return (
    await Promise.all(
      Object.entries(dataStore.store.project).map(
        async ([path, { id, lastAddedLines, svn }]) => ({
          path,
          id,
          addedLines:
            Date.now() - (await folderLatestModificationTime(path)).getTime() >
            1000 * 3600 * 24
              ? (
                  await Promise.all(
                    svn.map(
                      async ({ directory, revision }) =>
                        await getAddedLines(directory, revision),
                    ),
                  )
                ).reduce((accumulate, current) => accumulate + current, 0)
              : 0,
          lastAddedLines,
        }),
      ),
    )
  )
    .filter(({ addedLines }) => addedLines > 0)
    .forEach(({ path, id, addedLines, lastAddedLines }) => {
      log.debug('reportProjectAdditions', {
        path,
        id,
        addedLines,
        lastAddedLines,
      });
      dataStore.setProjectLastAddedLines(path, addedLines);
      statisticsReporterService.incrementLines(
        addedLines - lastAddedLines,
        Date.now(),
        Date.now(),
        id,
        packageJson.version,
      );
    });
};

export const svnCommit = async (projectPath: string, commitMessage: string) => {
  const { stdout, stderr } = await executeCommand(
    `svn commit -m ${commitMessage}`,
    projectPath,
  );
  if (stderr && stderr.length) {
    throw new Error(stderr);
  }
  return stdout;
};
