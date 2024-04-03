import { SVNClient } from '@taiyosen/easy-svn';
import log from 'electron-log/main';
import fs from 'fs';
import { resolve } from 'path';

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
