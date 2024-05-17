import log from 'electron-log/main';
import { parseStringPromise } from 'xml2js';

import { executeCommand } from 'main/utils/common';
import { FileStatus } from 'shared/types/service/SvnServiceTrait/types';
import { RepoStatusData } from 'main/services/SvnService/types';

const formatRepoStatusData = (data: RepoStatusData) => {
  const result: FileStatus[] = [];
  const entries = data.status.target.entry;
  if (!entries) {
    return result;
  }
  if (entries instanceof Array) {
    entries.forEach((entry) => {
      result.push({
        path: entry._attribute.path,
        status: entry['wc-status']._attribute.item,
      });
    });
  } else {
    result.push({
      path: entries._attribute.path,
      status: entries['wc-status']._attribute.item,
    });
  }
  return result;
};

export const repoStatus = async (path: string) => {
  const { stdout, stderr } = await executeCommand('svn status --xml', path);
  log.debug('repoStatus', { path, stdout, stderr });
  if (stderr && stderr.length) {
    log.error('SVN Get status error:', stderr);
    return [];
  }
  return formatRepoStatusData(
    await parseStringPromise(stdout, {
      attrkey: '_attribute',
      charkey: '_text',
      explicitCharkey: true,
      explicitArray: false,
    }),
  );
};

export const fileDiff = async (path: string, cwd?: string) => {
  const { stdout, stderr } = await executeCommand(`svn diff ${path}`, cwd);
  log.debug('fileDiff', { filePath: path, cwd, stdout, stderr });
  if (stderr && stderr.length) {
    throw new Error(stderr);
  }
  return stdout;
};
