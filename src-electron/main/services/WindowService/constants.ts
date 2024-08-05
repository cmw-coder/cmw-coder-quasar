import path from 'path';

export const cmwCoderSubprocessPath = process.env.PROD
  ? path.resolve(process.resourcesPath, 'cmw-coder-subprocess')
  : path.resolve(__dirname, '../../node_modules/cmw-coder-subprocess');
