import {
  executeCommand,
  folderLatestModificationTime,
} from 'main/utils/common';
import packageJson from 'root/package.json';
import { ServiceType } from 'shared/types/service';
import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { StatisticsService } from 'main/services/StatisticsService';
import { svnPath } from 'main/services/SvnService/constants';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import statisticsLog from 'main/components/Loggers/statisticsLog';

export const getRevision = async (path: string): Promise<number> => {
  const { stdout, stderr } = await executeCommand(`${svnPath} info`, path);
  if (stderr && stderr.length) {
    statisticsLog.error('Get SVN info failed:', stderr);
    return -1;
  }
  const revision = stdout.match(/Last Changed Rev: (\d+)/)?.[1];
  if (revision) {
    return parseInt(revision);
  }
  statisticsLog.error('Parse revision failed:', stdout);
  return -1;
};

/**
 * @deprecated
 */
export const getAddedLines = async (path: string, revision: number) => {
  const { stdout, stderr } = await executeCommand(
    `${svnPath} diff -r ${revision}`,
    path,
  );
  return (
    `${stdout}\n${stderr}`
      .split(NEW_LINE_REGEX)
      // Filter out lines that are not added lines
      .filter((line) => line.startsWith('+') && !line.startsWith('++'))
      // Filter out single line comments
      .filter((line) => !/\/\*[\s\S]*?\*\/|\/\/.*/g.test(line))
      // Remove the '+' sign
      .map((line) => line.substring(1))
      // Filter out empty lines
      .filter((line) => line.trim().length > 0).length
  );
};

/**
 * @deprecated
 */
export const reportProjectAdditions = async () => {
  const dataStoreService = container.get<DataStoreService>(
    ServiceType.DATA_STORE,
  );
  const appData = dataStoreService.getAppdata();
  const statisticsReporterService = container.get<StatisticsService>(
    ServiceType.STATISTICS,
  );
  return (
    await Promise.all(
      Object.entries(appData.project).map(
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
      statisticsLog.debug('reportProjectAdditions', {
        path,
        id,
        addedLines,
        lastAddedLines,
      });
      dataStoreService.setProjectLastAddedLines(path, addedLines);
      statisticsReporterService.incrementLines(
        addedLines - lastAddedLines,
        Date.now(),
        Date.now(),
        id,
        packageJson.version,
      );
    });
};
