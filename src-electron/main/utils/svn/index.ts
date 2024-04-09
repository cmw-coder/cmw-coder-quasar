import { SVNClient } from '@taiyosen/easy-svn';
import * as child_process from 'child_process';
import log from 'electron-log/main';
import fs from 'fs';
import { resolve } from 'path';
import * as iconv from 'iconv-lite';
// import { ChangedFile } from 'shared/types/ChangedFile';
import xml2js from 'xml2js';
import { detect } from 'jschardet';
import { ChangedFile, SvnStatusItem } from 'shared/types/SvnType';

export const searchSvnDirectories = async (
  folder: string,
): Promise<string[]> => {
  const directories: string[] = [];
  try {
    const items = await fs.promises.readdir(folder);
    for (const item of items) {
      const filePath = resolve(folder, item);
      const stats = await fs.promises.stat(filePath);
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

export const getAddedLines = async (
  path: string,
  revision: number,
): Promise<string[]> => {
  try {
    const client = new SVNClient();
    client.setConfig({ silent: true });
    const diff = await client.cmd(
      'diff',
      ['-r', revision.toString(), path],
      undefined,
      true,
    );
    return diff
      .split(/\r?\n/)
      .filter((line) => line.startsWith('+') && !line.startsWith('++'))
      .map((line) => line.substring(1))
      .filter((line) => line.trim().length > 0)
      .join('\r\n')
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      .split('\r\n');
  } catch {
    return [];
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatStatusRes = (data: any) => {
  const res = [] as SvnStatusItem[];
  const entries = data?.status?.target?.entry;
  if (!entries) {
    return res;
  }
  if (Object.prototype.toString.call(entries) === '[object Object]') {
    res.push({
      path: entries?._attribute?.path,
      type: entries['wc-status']?._attribute?.item,
    });
  } else if (Object.prototype.toString.call(entries) === '[object Array]') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries.forEach((entry: any) => {
      res.push({
        path: entry?._attribute?.path,
        type: entry['wc-status']?._attribute?.item,
      });
    });
  }
  return res;
};

export const getStatus = (path: string) => {
  return new Promise<SvnStatusItem[]>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const childProcess = child_process.spawn('svn', ['status', '--xml'], {
      cwd: path,
    });
    childProcess.stdout.on('data', (data) => {
      const detectRes = detect(data);
      if (detectRes.encoding !== 'UTF-8') {
        detectRes.encoding = 'GBK';
      }
      stdout += iconv.decode(data, detectRes.encoding);
    });
    childProcess.stderr.on('data', (data) => {
      const detectRes = detect(data);
      if (detectRes.encoding !== 'UTF-8') {
        detectRes.encoding = 'GBK';
      }
      stderr += iconv.decode(data, detectRes.encoding);
    });
    process.on('exit', (code: number, sig: number) => {
      if (childProcess.connected) {
        childProcess.kill(sig);
      }
    });
    childProcess.on('error', (err) => {
      reject(err);
    });
    childProcess.on('close', (code) => {
      if (code === 0) {
        xml2js.parseString(
          stdout,
          {
            attrkey: '_attribute',
            charkey: '_text',
            explicitCharkey: true,
            explicitArray: false,
          },
          (err, result) => {
            resolve(formatStatusRes(result));
          },
        );
      } else {
        reject(stderr);
      }
    });
  });
};

export const getFileDiffDetail = (projectPath: string, filePath: string) => {
  return new Promise<string>((resolve) => {
    let stdout = '';
    let stderr = '';
    const childProcess = child_process.spawn('svn', ['diff', filePath], {
      cwd: projectPath,
    });
    childProcess.stdout.on('data', (data) => {
      const detectRes = detect(data);
      if (detectRes.encoding !== 'UTF-8') {
        detectRes.encoding = 'GBK';
      }
      stdout += iconv.decode(data, detectRes.encoding);
    });
    childProcess.stderr.on('data', (data) => {
      const detectRes = detect(data);
      if (detectRes.encoding !== 'UTF-8') {
        detectRes.encoding = 'GBK';
      }
      stderr += iconv.decode(data, detectRes.encoding);
    });
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        resolve(stderr);
      }
    });
  });
};

export const getChangedFileList = async (path: string) => {
  const result = [] as ChangedFile[];
  const files = await getStatus(path);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const diffDetail = await getFileDiffDetail(path, file.path);
    let added = 0;
    let deleted = 0;
    const lines = diffDetail.split(/\r?\n/);
    lines.forEach((line) => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        added++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deleted++;
      }
    });
    result.push({
      ...file,
      additions: added,
      deletions: deleted,
      diff: diffDetail,
    });
  }
  return result;
};
