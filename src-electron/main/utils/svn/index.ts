import log from 'electron-log/main';

import {
  executeCommand,
  folderLatestModificationTime,
} from 'main/utils/common';
import packageJson from 'root/package.json';
import { container } from 'service';
import { DataStoreService } from 'service/entities/DataStoreService';
import { StatisticsService } from 'service/entities/StatisticsService';
import { ServiceType } from 'shared/services';

export const getRevision = async (path: string): Promise<number> => {
  const { stdout, stderr } = await executeCommand('svn info', path);
  if (stderr && stderr.length) {
    log.error('Get SVN info failed:', stderr);
    return -1;
  }
  const revision = stdout.match(/Last Changed Rev: (\d+)/)?.[1];
  if (revision) {
    return parseInt(revision);
  }
  log.error('Parse revision failed:', stdout);
  return -1;
};

export const getAddedLines = async (path: string, revision: number) => {
  const { stdout, stderr } = await executeCommand(
    `svn diff -r ${revision}`,
    path,
  );
  log.debug('getAddedLines', { path, revision, stdout, stderr });
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
  const statisticsReporterService = container.get<StatisticsService>(
    ServiceType.STATISTICS,
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
