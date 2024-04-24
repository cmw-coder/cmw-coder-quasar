import { exec } from 'child_process';
import { BrowserWindow } from 'electron';
import log from 'electron-log/main';
import { readdir, stat } from 'fs/promises';
import { decode } from 'iconv-lite';
import { detect } from 'jschardet';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const bypassCors = (window: BrowserWindow) =>
  window.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Headers': ['*'],
          ...details.responseHeaders,
        },
      });
    },
  );

export const executeCommand = async (
  command: string,
  workingDirectory?: string,
): Promise<{
  stdout: string;
  stderr: string;
}> => {
  const { stdout, stderr } = await execAsync(command, {
    cwd: workingDirectory,
  });
  const needDecode =
    (stdout.length && detect(stdout).encoding !== 'UTF-8') ||
    (stderr.length && detect(stderr).encoding !== 'UTF-8');
  log.debug('executeCommand', {
    command,
    workingDirectory,
    stdout,
    stderr,
    encoding: stdout.length ? detect(stdout).encoding : detect(stderr).encoding,
    needDecode,
  });

  return {
    stdout: needDecode ? decode(Buffer.from(stdout), 'GBK') : stdout,
    stderr: needDecode ? decode(Buffer.from(stderr), 'GBK') : stderr,
  };
};

export const folderLatestModificationTime = async (
  dir: string,
): Promise<Date> => {
  let latestTime = new Date(0);
  try {
    const files = await readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await stat(filePath);

      if (stats.isDirectory()) {
        const dirTime = await folderLatestModificationTime(filePath);
        if (dirTime > latestTime) {
          latestTime = dirTime;
        }
      } else if (stats.mtime > latestTime) {
        latestTime = stats.mtime;
      }
    }
  } catch {}
  return latestTime;
};
