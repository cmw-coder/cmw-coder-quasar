import path from 'path';

export const treeSitterFolder = process.env.PROD
  ? path.join(process.resourcesPath, 'tree-sitter')
  : path.join(__dirname, '../../src-electron/assets/tree-sitter');

export const reviewScriptPath = path.resolve(
  __dirname,
  '../../node_modules/cmw-coder-subprocess/dist/reviewManagerProcess.cjs',
);
