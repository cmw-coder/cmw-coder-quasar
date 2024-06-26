import path from 'path';
import log from 'electron-log/main';

export const svnPath = process.env.PROD
  ? `"${path.join(process.resourcesPath, 'svn', 'svn.exe')}"`
  : path.join(__dirname, '../../src-electron/assets/svn/svn.exe');

log.info('svnPath', { svnPath });
