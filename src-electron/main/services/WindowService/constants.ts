import path from 'path';

export const treeSitterFolder = process.env.PROD
  ? path.join(process.resourcesPath, 'tree-sitter')
  : path.join(__dirname, '../../src-electron/assets/tree-sitter');
