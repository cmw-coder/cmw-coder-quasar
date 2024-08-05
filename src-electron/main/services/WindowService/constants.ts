import path from 'path';

export const treeSitterFolder = process.env.PROD
  ? path.join(process.resourcesPath, 'tree-sitter')
  : path.join(__dirname, '../../src-electron/assets/tree-sitter');

export const reviewScriptPath = process.env.PROD
  ? path.resolve(
      process.resourcesPath,
      'cmw-coder-subprocess/dist/reviewManagerProcess.cjs',
    )
  : path.resolve(
      __dirname,
      '../../node_modules/cmw-coder-subprocess/dist/reviewManagerProcess.cjs',
    );
