import { BrowserWindow } from 'electron';
import { readdir, stat } from 'fs/promises';
import path from 'path';

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
    }
  );

export const folderLatestModificationTime = async (
  dir: string
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
