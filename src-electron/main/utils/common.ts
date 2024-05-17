import { exec } from 'child_process';
import { readdir, stat } from 'fs/promises';
import { decode } from 'iconv-lite';
import { detect } from 'jschardet';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
export const executeCommand = async (
  command: string,
  workingDirectory?: string,
): Promise<{
  stdout: string;
  stderr: string;
}> => {
  const { stdout, stderr } = await execAsync(command, {
    cwd: workingDirectory,
    encoding: 'buffer',
  });
  const needDecode =
    (stdout.length && detect(stdout).encoding !== 'UTF-8') ||
    (stderr.length && detect(stderr).encoding !== 'UTF-8');

  return {
    stdout: needDecode ? decode(stdout, 'GBK') : stdout.toString(),
    stderr: needDecode ? decode(stderr, 'GBK') : stderr.toString(),
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
