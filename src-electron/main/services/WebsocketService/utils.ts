import { lstatSync, existsSync } from 'fs';
import { resolve } from 'path';

export const findSvnPath = (filePath: string): string | undefined => {
  if (!existsSync(filePath)) {
    return;
  }

  let currentPath = resolve(filePath, '..');
  while (currentPath.length) {
    if (lstatSync(currentPath).isDirectory()) {
      const svnPath = resolve(currentPath, '.svn');
      if (existsSync(svnPath) && lstatSync(svnPath).isDirectory()) {
        return currentPath;
      }
    }
    const parentPath = resolve(currentPath, '..');
    if (parentPath === currentPath) {
      break;
    }
    currentPath = parentPath;
  }
};
